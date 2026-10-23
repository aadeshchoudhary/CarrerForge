"""
Skill Gap Analysis schemas with explainable formula transparency.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class JobDescriptionOut(BaseModel):
    id: str
    title: str
    company: str
    location: str
    source_url: Optional[str] = None
    description_text: str
    essential_skills: List[str]
    preferred_skills: List[str]
    experience_level: str

    class Config:
        from_attributes = True


class SkillGapRequest(BaseModel):
    job_id: Optional[str] = None
    custom_job_text: Optional[str] = None
    custom_job_title: Optional[str] = "Custom Target Role"
    resume_id: Optional[str] = None


class SkillGapReportOut(BaseModel):
    id: str
    user_id: str
    job_id: str
    resume_id: Optional[str] = None
    coverage_score: float
    matched_skills: List[str]
    missing_essential: List[str]
    missing_preferred: List[str]
    needs_evidence: List[str]
    formula_breakdown: Dict[str, Any]
    improvement_advice: Optional[str] = None
    disclaimer: str = (
        "This score is an algorithmic estimate of stated job requirement coverage based on resume text. "
        "It is not an official employer score or a guarantee of interview selection."
    )
    created_at: datetime

    class Config:
        from_attributes = True


class UserSkillOut(BaseModel):
    id: str
    skill_name: str
    category: str
    evidence_level: str
    years_experience: int

    class Config:
        from_attributes = True
