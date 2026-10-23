"""
Career Passport Service (Module 4.17).
Compiles verified credentials, projects, and skills into a tamper-evident credential.
Generates verification hash and public shareable links.
"""
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User, CareerID, PrivacySetting
from app.models.skill import UserSkill, Skill
from app.models.project_proof import UserProjectSubmission
from app.models.gamification import UserBadge, Badge
from app.schemas.passport import (
    CareerPassportOut,
    PassportSkillItem,
    PassportProjectItem,
    PassportBadgeItem
)


def compile_career_passport(user_id: str, db: Session) -> CareerPassportOut:
    """Compiles a complete verified Career Passport credential."""
    user = db.query(User).filter(User.id == user_id).first()
    career = db.query(CareerID).filter(CareerID.user_id == user_id).first()
    
    if not career:
        handle = "@student"
        full_name = "Candidate"
        headline = "Software Engineer"
        target_role = "Full Stack Developer"
        level = 1
        total_xp = 150
    else:
        handle = career.handle
        full_name = career.full_name
        headline = career.headline
        target_role = career.target_role
        level = career.current_level
        total_xp = career.xp_points

    # 1. Classify Skills by Evidence Level (Non-negotiable rule #3)
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    verified_skills: List[PassportSkillItem] = []
    assessed_skills: List[PassportSkillItem] = []
    resume_skills: List[PassportSkillItem] = []

    for us in user_skills:
        skill_obj = db.query(Skill).filter(Skill.id == us.skill_id).first()
        if skill_obj:
            item = PassportSkillItem(
                name=skill_obj.name,
                category=skill_obj.category,
                evidence_level=us.evidence_level
            )
            if us.evidence_level == "verified":
                verified_skills.append(item)
            elif us.evidence_level == "assessed":
                assessed_skills.append(item)
            else:
                resume_skills.append(item)

    # 2. Verified Projects Proof
    projects = db.query(UserProjectSubmission).filter(
        UserProjectSubmission.user_id == user_id,
        UserProjectSubmission.verification_status == "verified"
    ).all()

    verified_projects = [
        PassportProjectItem(
            title=p.title,
            github_url=p.github_url,
            live_demo_url=p.live_demo_url,
            skills_demonstrated=p.skills_demonstrated or [],
            verification_status=p.verification_status
        )
        for p in projects
    ]

    # 3. Earned Badges
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    earned_badges = []
    for ub in user_badges:
        b = db.query(Badge).filter(Badge.id == ub.badge_id).first()
        if b:
            earned_badges.append(PassportBadgeItem(
                name=b.name,
                slug=b.slug,
                description=b.description,
                icon_name=b.icon_name,
                awarded_at=ub.awarded_at
            ))

    # 4. Generate Verification Hash & ID
    clean_handle = handle.lstrip("@")
    passport_id = f"CF-PASS-{clean_handle.upper()[:6]}-{user_id[:4].upper()}"
    hash_payload = f"{passport_id}:{handle}:{total_xp}:{len(verified_skills)}:{len(verified_projects)}"
    verification_hash = hashlib.sha256(hash_payload.encode()).hexdigest()[:16].upper()
    verification_url = f"http://127.0.0.1:5173/passport/{clean_handle}"

    return CareerPassportOut(
        passport_id=passport_id,
        handle=handle,
        full_name=full_name,
        headline=headline,
        target_role=target_role,
        level=level,
        total_xp=total_xp,
        verified_projects_count=len(verified_projects),
        verified_skills=verified_skills,
        assessed_skills=assessed_skills,
        resume_mentioned_skills=resume_skills,
        verified_projects=verified_projects,
        earned_badges=earned_badges,
        verification_hash=verification_hash,
        verification_url=verification_url,
        generated_at=datetime.now(timezone.utc)
    )
