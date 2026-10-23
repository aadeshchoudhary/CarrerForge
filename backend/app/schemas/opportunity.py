"""
Pydantic schemas for Phase 5:
- Job Applications & Kanban Tracker
- Company Explorer
- AI Interview Gym
- Technology Trends & Market Intelligence
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Job Application Tracking Schemas
# -------------------------------------------------------------
class JobApplicationCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=150)
    job_title: str = Field(..., min_length=2, max_length=150)
    stage: str = Field("applied", description="saved, applied, screening, interview, offer, rejected")
    location: Optional[str] = "Remote / Hybrid"
    salary_range: Optional[str] = None
    job_url: Optional[str] = None
    next_interview_date: Optional[datetime] = None
    notes: Optional[str] = None
    match_score: Optional[float] = 80.0


class JobApplicationUpdate(BaseModel):
    stage: Optional[str] = None
    next_interview_date: Optional[datetime] = None
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    match_score: Optional[float] = None


class JobApplicationOut(BaseModel):
    id: str
    user_id: str
    company_name: str
    job_title: str
    stage: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_url: Optional[str] = None
    applied_date: datetime
    next_interview_date: Optional[datetime] = None
    notes: Optional[str] = None
    match_score: float = 80.0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationStatsOut(BaseModel):
    total_applications: int
    saved_count: int
    applied_count: int
    screening_count: int
    interview_count: int
    offer_count: int
    rejected_count: int
    active_interviews_count: int


# -------------------------------------------------------------
# Company Explorer Schemas
# -------------------------------------------------------------
class CompanyOut(BaseModel):
    id: str
    name: str
    industry: str
    location: str
    website: Optional[str] = None
    description: str
    tech_stack: List[str]
    hiring_status: str
    typical_interview_rounds: Optional[str] = None
    interview_tips: Optional[str] = None

    class Config:
        from_attributes = True


# -------------------------------------------------------------
# AI Interview Gym Schemas
# -------------------------------------------------------------
class InterviewQuestionOut(BaseModel):
    role_title: str
    interview_type: str
    question_text: str
    hints: List[str]


class InterviewEvaluationRequest(BaseModel):
    role_title: str
    interview_type: str = "technical"
    question_text: str
    user_answer: str = Field(..., min_length=10)


class InterviewEvaluationOut(BaseModel):
    id: str
    role_title: str
    interview_type: str
    question_text: str
    user_answer: str
    ai_score: float
    strengths: List[str]
    areas_for_improvement: List[str]
    suggested_answer: str
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------------------------------------
# Technology Trends Schemas
# -------------------------------------------------------------
class TechTrendOut(BaseModel):
    id: str
    name: str
    category: str
    demand_growth: str
    market_adoption: str
    avg_salary_inr: str
    open_roles_count: int
    top_pairing_skills: List[str]
    description: str

    class Config:
        from_attributes = True
