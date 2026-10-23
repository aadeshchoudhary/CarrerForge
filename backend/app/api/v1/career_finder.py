"""
Career and Job Role Finder Endpoints (Module 2.5).
Ranks career paths based on user skills, education, and interests.
Enables side-by-side comparison of multiple career trajectories.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, CareerID
from app.models.gap_report import JobDescription
from app.models.skill import UserSkill, Skill
from app.services.skill_matcher import calculate_weighted_coverage, normalize_skill
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/explore", response_model=List[Dict[str, Any]])
def explore_career_roles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ranks available job roles against candidate's current profile.
    Shows compatibility score, why the role matches, and primary improvement areas.
    """
    career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
    target_role = career.target_role if career else "Full Stack Developer"

    # Get user's confirmed skills
    user_skills_records = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    user_skills = []
    for us in user_skills_records:
        s = db.query(Skill).filter(Skill.id == us.skill_id).first()
        if s:
            user_skills.append(s.name)

    if not user_skills:
        user_skills = ["Python", "JavaScript", "HTML", "SQL", "Git"]

    jobs = db.query(JobDescription).all()
    role_comparisons = []

    for job in jobs:
        analysis = calculate_weighted_coverage(
            candidate_skills=user_skills,
            essential_requirements=job.essential_skills or [],
            preferred_requirements=job.preferred_skills or []
        )

        match_score = analysis["coverage_score"]
        matched_count = len(analysis["matched_skills"])
        missing_count = len(analysis["missing_essential"])

        # Formulate contextual reasons
        reasons = []
        if matched_count > 0:
            reasons.append(f"You already demonstrate {matched_count} foundational skills for this path.")
        if match_score >= 70:
            reasons.append("High overlap with your existing technical background.")
        elif match_score >= 40:
            reasons.append("Moderate overlap; accessible after completing 1-2 focused roadmap projects.")
        else:
            reasons.append("Requires learning fundamental prerequisites.")

        role_comparisons.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "experience_level": job.experience_level,
            "compatibility_score": match_score,
            "is_current_target": (target_role.lower() in job.title.lower() or job.title.lower() in target_role.lower()),
            "essential_skills": job.essential_skills,
            "preferred_skills": job.preferred_skills,
            "matched_skills": analysis["matched_skills"],
            "missing_essential": analysis["missing_essential"],
            "reasons": reasons,
            "improvement_focus": analysis["missing_essential"][:2] if analysis["missing_essential"] else ["Build advanced capstone project"]
        })

    # Sort roles by compatibility descending
    role_comparisons.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return role_comparisons
