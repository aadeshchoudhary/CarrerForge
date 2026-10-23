"""
Resume Upload, Document Parsing, and Parsed Data Review Endpoints.
"""
import os
import shutil
import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, CareerID
from app.models.resume import Resume, ParsedResumeData
from app.models.skill import Skill, UserSkill
from app.schemas.resume import ResumeOut, ParsedResumeOut, ResumeReviewUpdate
from app.services.resume_parser import parse_resume_document
from app.services.skill_matcher import normalize_skill
from app.api.v1.deps import get_current_user

router = APIRouter()

# Max allowed upload size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload", response_model=ResumeOut)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a resume in PDF or DOCX format.
    Extracts text, structures sections, isolates skills, evaluates confidence,
    and assigns skills with the 'resume_mentioned' evidence badge.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a PDF or DOCX resume document."
        )

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save file with unique safe name
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Check file size
    if os.path.getsize(file_path) > MAX_FILE_SIZE:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10MB limit."
        )

    # Parse document
    try:
        parsed_result = parse_resume_document(file_path, file.filename)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing resume document: {str(e)}"
        )

    # Create Resume DB record
    new_resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_type=ext.replace(".", ""),
        file_path=file_path,
        raw_text=parsed_result["raw_text"]
    )
    db.add(new_resume)
    db.flush()

    # Create ParsedResumeData DB record
    parsed_record = ParsedResumeData(
        resume_id=new_resume.id,
        personal_info=parsed_result["personal_info"],
        education=parsed_result["education"],
        work_experience=parsed_result["work_experience"],
        projects=parsed_result["projects"],
        certifications=parsed_result["certifications"],
        extracted_skills=parsed_result["extracted_skills"],
        extraction_confidence=parsed_result["extraction_confidence"],
        extraction_warnings=parsed_result["extraction_warnings"]
    )
    db.add(parsed_record)

    # Sync extracted skills to UserSkills with evidence_level='resume_mentioned'
    for skill_name in parsed_result["extracted_skills"]:
        norm = normalize_skill(skill_name)
        skill_obj = db.query(Skill).filter(Skill.normalized_name == norm).first()
        if not skill_obj:
            skill_obj = Skill(name=skill_name, normalized_name=norm, category="Technical")
            db.add(skill_obj)
            db.flush()

        # Check if user already has this skill
        existing_user_skill = db.query(UserSkill).filter(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_id == skill_obj.id
        ).first()

        if not existing_user_skill:
            user_skill = UserSkill(
                user_id=current_user.id,
                skill_id=skill_obj.id,
                evidence_level="resume_mentioned"
            )
            db.add(user_skill)

    # Award XP for resume upload
    career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
    if career:
        career.xp_points += 50
        if career.xp_points >= 300 and career.current_level < 2:
            career.current_level = 2

    db.commit()
    db.refresh(new_resume)
    return new_resume


@router.get("/latest", response_model=ResumeOut)
def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the user's latest parsed resume with all structured sections."""
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No uploaded resume found. Please upload a resume first."
        )
    return resume


@router.put("/{resume_id}/review", response_model=ParsedResumeOut)
def review_parsed_resume(
    resume_id: str,
    update_data: ResumeReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allow candidate to inspect, edit, and correct parsed information
    (e.g., fix missed degree name, refine project description).
    """
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume record not found.")

    parsed = db.query(ParsedResumeData).filter(ParsedResumeData.resume_id == resume_id).first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed data not found.")

    if update_data.personal_info is not None:
        parsed.personal_info = update_data.personal_info
    if update_data.education is not None:
        parsed.education = update_data.education
    if update_data.work_experience is not None:
        parsed.work_experience = update_data.work_experience
    if update_data.projects is not None:
        parsed.projects = update_data.projects
    if update_data.certifications is not None:
        parsed.certifications = update_data.certifications
    if update_data.extracted_skills is not None:
        parsed.extracted_skills = update_data.extracted_skills

    db.commit()
    db.refresh(parsed)
    return parsed
