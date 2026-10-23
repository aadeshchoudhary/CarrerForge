"""
Skill Gap Analysis Endpoints.
Implements the explainable weighted coverage calculation between candidate and job requirements.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, CareerID
from app.models.resume import Resume, ParsedResumeData
from app.models.skill import UserSkill, Skill
from app.models.gap_report import JobDescription, SkillGapReport
from app.schemas.skills import (
    JobDescriptionOut,
    SkillGapRequest,
    SkillGapReportOut,
)
from app.services.skill_matcher import calculate_weighted_coverage, extract_skills_from_text
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/jobs/sample", response_model=List[JobDescriptionOut])
def get_sample_jobs(db: Session = Depends(get_db)):
    """Retrieve benchmark job descriptions with curated essential and preferred requirements."""
    jobs = db.query(JobDescription).all()
    return jobs


@router.post("/analyze-gap", response_model=SkillGapReportOut)
def analyze_skill_gap(
    request: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Perform explainable skill-gap analysis.
    Compares candidate's skills against job requirements using the documented weighted formula.
    """
    # 1. Resolve Target Job Requirements
    if request.job_id:
        job = db.query(JobDescription).filter(JobDescription.id == request.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job description not found.")
        essential_reqs = job.essential_skills or []
        preferred_reqs = job.preferred_skills or []
        target_job_id = job.id
    elif request.custom_job_text:
        # Extract skills from pasted JD text
        extracted = extract_skills_from_text(request.custom_job_text)
        if not extracted:
            raise HTTPException(
                status_code=400,
                detail="Could not detect standard technical skills in the pasted job description."
            )
        # Partition first 60% as essential, remainder as preferred
        split_idx = max(1, int(len(extracted) * 0.6))
        essential_reqs = extracted[:split_idx]
        preferred_reqs = extracted[split_idx:]

        # Create temporary custom JobDescription record
        custom_job = JobDescription(
            title=request.custom_job_title or "Custom Target Role",
            company="Custom Analysis",
            description_text=request.custom_job_text,
            essential_skills=essential_reqs,
            preferred_skills=preferred_reqs,
            experience_level="Custom"
        )
        db.add(custom_job)
        db.flush()
        target_job_id = custom_job.id
    else:
        raise HTTPException(
            status_code=400,
            detail="Must provide either a job_id or custom_job_text."
        )

    # 2. Resolve Candidate Skills
    candidate_skills: List[str] = []
    resume_id = request.resume_id

    if not resume_id:
        # Pick latest resume
        latest_resume = (
            db.query(Resume)
            .filter(Resume.user_id == current_user.id)
            .order_by(Resume.uploaded_at.desc())
            .first()
        )
        if latest_resume:
            resume_id = latest_resume.id

    if resume_id:
        parsed_data = db.query(ParsedResumeData).filter(ParsedResumeData.resume_id == resume_id).first()
        if parsed_data and parsed_data.extracted_skills:
            candidate_skills.extend(parsed_data.extracted_skills)

    # Also include skills directly in UserSkill table
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    for us in user_skills:
        skill_obj = db.query(Skill).filter(Skill.id == us.skill_id).first()
        if skill_obj and skill_obj.name not in candidate_skills:
            candidate_skills.append(skill_obj.name)

    if not candidate_skills:
        # If user has no resume or skills yet, provide fallback guidance
        candidate_skills = ["Communication", "Problem Solving"]

    # 3. Compute Weighted Coverage Score
    analysis = calculate_weighted_coverage(
        candidate_skills=candidate_skills,
        essential_requirements=essential_reqs,
        preferred_requirements=preferred_reqs
    )

    # 4. Save SkillGapReport record
    report = SkillGapReport(
        user_id=current_user.id,
        job_id=target_job_id,
        resume_id=resume_id,
        coverage_score=analysis["coverage_score"],
        matched_skills=analysis["matched_skills"],
        missing_essential=analysis["missing_essential"],
        missing_preferred=analysis["missing_preferred"],
        needs_evidence=analysis["needs_evidence"],
        formula_breakdown=analysis["formula_breakdown"],
        improvement_advice=analysis["improvement_advice"]
    )
    db.add(report)

    # Reward XP for analyzing job gap (+25 XP)
    career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
    if career:
        career.xp_points += 25

    db.commit()
    db.refresh(report)
    return report


@router.get("/reports/{report_id}", response_model=SkillGapReportOut)
def get_report_by_id(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve an existing skill-gap report with its formula breakdown."""
    report = (
        db.query(SkillGapReport)
        .filter(SkillGapReport.id == report_id, SkillGapReport.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Skill gap report not found.")
    return report
