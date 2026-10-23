"""
Badge and Gamification Engine Service (Module 4.18).
Defines published criteria for 8 core badges and evaluates unlock conditions automatically.
Participation points are strictly separated from demonstrated code ability.
"""
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.gamification import Badge, UserBadge
from app.models.user import User, CareerID
from app.models.resume import Resume
from app.models.skill import UserSkill
from app.models.project_proof import UserProjectSubmission
from app.models.tracker import UserGoal, StudyLog
from app.models.gap_report import SkillGapReport

MASTER_BADGES = [
    {
        "slug": "first_step",
        "name": "First Step",
        "description": "Claimed unique Career ID handle and established base career profile.",
        "category": "milestone",
        "icon_name": "Award",
        "xp_reward": 50,
        "criteria_rule": "Account registered with unique @handle."
    },
    {
        "slug": "resume_ready",
        "name": "Resume Ready",
        "description": "Uploaded and parsed first professional resume document.",
        "category": "milestone",
        "icon_name": "FileText",
        "xp_reward": 50,
        "criteria_rule": "At least 1 resume document parsed with confidence score."
    },
    {
        "slug": "skill_builder",
        "name": "Skill Builder",
        "description": "Demonstrated at least 5 technical or foundational skills in profile matrix.",
        "category": "skill",
        "icon_name": "Code2",
        "xp_reward": 75,
        "criteria_rule": "5 or more registered skills in candidate profile."
    },
    {
        "slug": "project_champion",
        "name": "Project Champion",
        "description": "Submitted an independently verified GitHub code repository as proof-of-work.",
        "category": "proof",
        "icon_name": "ShieldCheck",
        "xp_reward": 100,
        "criteria_rule": "At least 1 verified project submission linked to skills."
    },
    {
        "slug": "goal_crusher",
        "name": "Goal Crusher",
        "description": "Maintained execution consistency by completing 3 daily preparation goals.",
        "category": "consistency",
        "icon_name": "CheckCircle2",
        "xp_reward": 50,
        "criteria_rule": "3 or more preparation goals marked completed."
    },
    {
        "slug": "consistency_star",
        "name": "Consistency Star",
        "description": "Logged focused study or coding hours and maintained a learning streak.",
        "category": "consistency",
        "icon_name": "Flame",
        "xp_reward": 75,
        "criteria_rule": "At least 2 active study sessions recorded."
    },
    {
        "slug": "career_explorer",
        "name": "Career Explorer",
        "description": "Performed skill-gap analysis across benchmark job roles.",
        "category": "milestone",
        "icon_name": "Compass",
        "xp_reward": 50,
        "criteria_rule": "At least 1 skill-gap report generated."
    },
    {
        "slug": "quiz_master",
        "name": "Quiz Master",
        "description": "Demonstrated technical readiness across essential job requirements.",
        "category": "skill",
        "icon_name": "Sparkles",
        "xp_reward": 75,
        "criteria_rule": "Target role compatibility score of 70% or higher."
    }
]


def seed_badges_catalog_if_empty(db: Session):
    """Seed the 8 core badges if table is empty."""
    count = db.query(Badge).count()
    if count == 0:
        for b in MASTER_BADGES:
            new_badge = Badge(**b)
            db.add(new_badge)
        db.commit()


def check_and_award_badges(user_id: str, db: Session) -> List[Badge]:
    """
    Evaluates candidate's activities and unlocks any newly earned badges.
    Awards badge XP and increments user badge count idempotently.
    """
    awarded_this_check: List[Badge] = []

    # Get already unlocked badge IDs
    existing_user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    unlocked_badge_ids = {ub.badge_id for ub in existing_user_badges}

    all_badges = db.query(Badge).all()
    badge_map = {b.slug: b for b in all_badges}

    career = db.query(CareerID).filter(CareerID.user_id == user_id).first()

    def grant_badge(slug: str):
        b = badge_map.get(slug)
        if b and b.id not in unlocked_badge_ids:
            user_b = UserBadge(user_id=user_id, badge_id=b.id, awarded_at=datetime.now(timezone.utc))
            db.add(user_b)
            unlocked_badge_ids.add(b.id)
            awarded_this_check.append(b)
            if career:
                career.xp_points += b.xp_reward
                career.badges_count += 1

    # Rule 1: First Step (Account exists)
    grant_badge("first_step")

    # Rule 2: Resume Ready (Has uploaded resume)
    has_resume = db.query(Resume).filter(Resume.user_id == user_id).first() is not None
    if has_resume:
        grant_badge("resume_ready")

    # Rule 3: Skill Builder (>= 5 skills)
    skills_count = db.query(UserSkill).filter(UserSkill.user_id == user_id).count()
    if skills_count >= 5:
        grant_badge("skill_builder")

    # Rule 4: Project Champion (>= 1 verified project)
    has_project = db.query(UserProjectSubmission).filter(
        UserProjectSubmission.user_id == user_id,
        UserProjectSubmission.verification_status == "verified"
    ).first() is not None
    if has_project:
        grant_badge("project_champion")

    # Rule 5: Goal Crusher (>= 3 completed goals)
    completed_goals = db.query(UserGoal).filter(
        UserGoal.user_id == user_id,
        UserGoal.is_completed == True
    ).count()
    if completed_goals >= 3:
        grant_badge("goal_crusher")

    # Rule 6: Consistency Star (>= 2 study logs)
    study_logs = db.query(StudyLog).filter(StudyLog.user_id == user_id).count()
    if study_logs >= 2:
        grant_badge("consistency_star")

    # Rule 7: Career Explorer (>= 1 gap report)
    gap_reports = db.query(SkillGapReport).filter(SkillGapReport.user_id == user_id).count()
    if gap_reports >= 1:
        grant_badge("career_explorer")

    # Rule 8: Quiz Master (Coverage score >= 70% in any report)
    high_score_report = db.query(SkillGapReport).filter(
        SkillGapReport.user_id == user_id,
        SkillGapReport.coverage_score >= 70.0
    ).first() is not None
    if high_score_report:
        grant_badge("quiz_master")

    if awarded_this_check:
        db.commit()

    return awarded_this_check
