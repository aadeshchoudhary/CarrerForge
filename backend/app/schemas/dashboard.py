"""
Aggregated Dashboard Widget Schemas.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.profile import CareerIDOut
from app.schemas.skills import SkillGapReportOut


class ReadinessBreakdown(BaseModel):
    technical_score: int       # 0-100
    project_score: int         # 0-100
    resume_score: int          # 0-100
    interview_score: int       # 0-100
    overall_score: int         # 0-100
    summary_text: str


class CareerQuestItem(BaseModel):
    id: str
    title: str
    description: str
    xp_reward: int
    progress: int              # e.g. 1
    total: int                 # e.g. 1
    is_completed: bool


class DashboardSummaryOut(BaseModel):
    career_profile: CareerIDOut
    readiness: ReadinessBreakdown
    latest_gap_report: Optional[SkillGapReportOut] = None
    next_best_action: Dict[str, Any]
    active_quests: List[CareerQuestItem]
    recent_skills: List[Dict[str, str]]
