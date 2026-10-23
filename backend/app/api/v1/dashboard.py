"""
Aggregated Dashboard Widget Summary Endpoint.
Powers the responsive, unified dashboard UI.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, CareerID
from app.models.resume import Resume, ParsedResumeData
from app.models.gap_report import SkillGapReport
from app.models.skill import UserSkill, Skill
from app.schemas.profile import CareerIDOut
from app.schemas.skills import SkillGapReportOut
from app.schemas.dashboard import (
    DashboardSummaryOut,
    ReadinessBreakdown,
    CareerQuestItem
)
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated metrics for all dashboard widgets in a single optimized query.
    """
    # 1. Career ID
    career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
    if not career:
        career = CareerID(user_id=current_user.id, handle=f"@user_{current_user.id[:6]}", full_name="Student")
        db.add(career)
        db.commit()
        db.refresh(career)

    # 2. Latest Resume & Parsed Data
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    parsed_data = None
    if latest_resume:
        parsed_data = db.query(ParsedResumeData).filter(ParsedResumeData.resume_id == latest_resume.id).first()

    # 3. Latest Skill Gap Report
    latest_gap = (
        db.query(SkillGapReport)
        .filter(SkillGapReport.user_id == current_user.id)
        .order_by(SkillGapReport.created_at.desc())
        .first()
    )

    # 4. Compute Readiness Score Ring
    # Technical score from gap report coverage or parsed skills count
    tech_score = int(latest_gap.coverage_score) if latest_gap else (min(80, len(parsed_data.extracted_skills) * 10) if parsed_data else 30)
    
    # Project score from projects section
    proj_score = min(100, len(parsed_data.projects) * 35) if parsed_data and parsed_data.projects else 25
    
    # Resume quality score
    resume_score = int((parsed_data.extraction_confidence or 0.7) * 100) if parsed_data else 20
    
    # Interview score baseline
    interview_score = 45 if tech_score < 60 else 65

    overall_readiness = int(
        (0.35 * tech_score) + (0.25 * proj_score) + (0.20 * resume_score) + (0.20 * interview_score)
    )

    summary_text = (
        f"Your profile is {overall_readiness}% ready for entry-level {career.target_role} roles. "
        "Complete a targeted project to boost your project proof score."
    )

    readiness = ReadinessBreakdown(
        technical_score=tech_score,
        project_score=proj_score,
        resume_score=resume_score,
        interview_score=interview_score,
        overall_score=overall_readiness,
        summary_text=summary_text
    )

    # 5. Career Quests Progress
    has_uploaded_resume = latest_resume is not None
    has_analyzed_gap = latest_gap is not None

    quests = [
        CareerQuestItem(
            id="quest-1",
            title="Create Your Career ID",
            description="Claim your unique professional handle and setup your base profile.",
            xp_reward=50,
            progress=1,
            total=1,
            is_completed=True
        ),
        CareerQuestItem(
            id="quest-2",
            title="Upload First Resume",
            description="Parse your PDF/DOCX resume to detect demonstrated skills automatically.",
            xp_reward=50,
            progress=1 if has_uploaded_resume else 0,
            total=1,
            is_completed=has_uploaded_resume
        ),
        CareerQuestItem(
            id="quest-3",
            title="Perform Skill-Gap Analysis",
            description="Compare your current skills with a benchmark or custom job description.",
            xp_reward=75,
            progress=1 if has_analyzed_gap else 0,
            total=1,
            is_completed=has_analyzed_gap
        ),
        CareerQuestItem(
            id="quest-4",
            title="Build a Project to Proof",
            description="Link a live GitHub repository to provide verified evidence for a missing skill.",
            xp_reward=100,
            progress=0,
            total=1,
            is_completed=False
        )
    ]

    # 6. Dynamic Next Best Action Card
    if not has_uploaded_resume:
        next_action = {
            "title": "Upload your resume to discover your skill baseline",
            "subtitle": "Our parser will extract your experience and categorize your skills.",
            "cta_label": "Upload Resume",
            "cta_link": "/resume-parser",
            "type": "resume"
        }
    elif not has_analyzed_gap:
        next_action = {
            "title": f"Analyze your match for {career.target_role}",
            "subtitle": "See which essential skills you have and what is missing before applying.",
            "cta_label": "Run Skill Gap Analysis",
            "cta_link": "/skill-gap",
            "type": "gap"
        }
    else:
        top_missing = latest_gap.missing_essential[0] if latest_gap.missing_essential else "System Design"
        next_action = {
            "title": f"Bridge the gap: Learn {top_missing}",
            "subtitle": f"{top_missing} is an essential requirement. Review curated learning tutorials.",
            "cta_label": f"Explore {top_missing} Roadmap",
            "cta_link": "/skill-gap",
            "type": "learn"
        }

    # 7. Recent Skills with Evidence
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).limit(8).all()
    recent_skills = []
    for us in user_skills:
        s = db.query(Skill).filter(Skill.id == us.skill_id).first()
        if s:
            recent_skills.append({
                "name": s.name,
                "category": s.category,
                "evidence_level": us.evidence_level
            })

    return DashboardSummaryOut(
        career_profile=CareerIDOut.model_validate(career),
        readiness=readiness,
        latest_gap_report=SkillGapReportOut.model_validate(latest_gap) if latest_gap else None,
        next_best_action=next_action,
        active_quests=quests,
        recent_skills=recent_skills
    )
