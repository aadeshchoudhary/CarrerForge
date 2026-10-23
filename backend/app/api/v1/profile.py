"""
Profile, Career ID, and Privacy Control endpoints.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, CareerID, PrivacySetting
from app.models.skill import UserSkill, Skill
from app.schemas.profile import CareerIDOut, ProfileUpdate, PrivacySettingsOut, PrivacySettingsUpdate
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/me", response_model=Dict[str, Any])
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve complete profile of currently logged-in user."""
    career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
    privacy = db.query(PrivacySetting).filter(PrivacySetting.user_id == current_user.id).first()
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()

    skills_data = []
    for us in user_skills:
        skill_record = db.query(Skill).filter(Skill.id == us.skill_id).first()
        if skill_record:
            skills_data.append({
                "id": us.id,
                "name": skill_record.name,
                "category": skill_record.category,
                "evidence_level": us.evidence_level,
                "years_experience": us.years_experience
            })

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "career_id": CareerIDOut.model_validate(career) if career else None,
        "privacy": PrivacySettingsOut.model_validate(privacy) if privacy else None,
        "skills": skills_data
    }


@router.put("/me", response_model=CareerIDOut)
def update_my_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile information (bio, headline, target role, visibility)."""
    career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career ID record not found")

    if profile_in.full_name is not None:
        career.full_name = profile_in.full_name
    if profile_in.headline is not None:
        career.headline = profile_in.headline
    if profile_in.bio is not None:
        career.bio = profile_in.bio
    if profile_in.target_role is not None:
        career.target_role = profile_in.target_role
    if profile_in.visibility is not None:
        career.visibility = profile_in.visibility

    db.commit()
    db.refresh(career)
    return career


@router.put("/privacy", response_model=PrivacySettingsOut)
def update_privacy_settings(
    privacy_in: PrivacySettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user privacy and data-sharing controls."""
    privacy = db.query(PrivacySetting).filter(PrivacySetting.user_id == current_user.id).first()
    if not privacy:
        raise HTTPException(status_code=404, detail="Privacy settings record not found")

    for field, value in privacy_in.dict(exclude_unset=True).items():
        setattr(privacy, field, value)

    db.commit()
    db.refresh(privacy)
    return privacy


@router.get("/public/{handle}", response_model=Dict[str, Any])
def get_public_profile(handle: str, db: Session = Depends(get_db)):
    """
    Public Career ID endpoint accessible to mentors, recruiters, and peers.
    Strictly filters data according to user's privacy visibility settings.
    """
    clean_handle = handle if handle.startswith("@") else f"@{handle}"
    career = db.query(CareerID).filter(CareerID.handle == clean_handle).first()
    if not career or career.visibility == "private":
        raise HTTPException(status_code=404, detail="Profile not found or is set to private.")

    privacy = db.query(PrivacySetting).filter(PrivacySetting.user_id == career.user_id).first()
    user = db.query(User).filter(User.id == career.user_id).first()

    skills_data = []
    if privacy and privacy.show_skills:
        user_skills = db.query(UserSkill).filter(UserSkill.user_id == career.user_id).all()
        for us in user_skills:
            skill_record = db.query(Skill).filter(Skill.id == us.skill_id).first()
            if skill_record:
                skills_data.append({
                    "name": skill_record.name,
                    "category": skill_record.category,
                    "evidence_level": us.evidence_level,
                })

    return {
        "handle": career.handle,
        "full_name": career.full_name,
        "headline": career.headline,
        "bio": career.bio,
        "target_role": career.target_role,
        "level": career.current_level,
        "badges_count": career.badges_count,
        "email": user.email if (privacy and privacy.show_email) else None,
        "skills": skills_data if (privacy and privacy.show_skills) else None,
    }
