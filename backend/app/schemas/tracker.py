"""
Schemas for Preparation Tracker and Daily Goals (Module 3.15).
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class UserGoalCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    category: str = Field("study", description="study, project, quiz, application")
    target_date: Optional[str] = "Today"


class UserGoalOut(BaseModel):
    id: str
    user_id: str
    title: str
    category: str
    target_date: Optional[str] = None
    is_completed: bool
    source_type: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudyLogCreate(BaseModel):
    topic: str = Field(..., min_length=2, max_length=150)
    hours_spent: float = Field(..., gt=0, le=24)
    notes: Optional[str] = None


class StudyLogOut(BaseModel):
    id: str
    topic: str
    hours_spent: float
    notes: Optional[str] = None
    logged_date: datetime

    class Config:
        from_attributes = True


class TrackerSummaryOut(BaseModel):
    total_goals_today: int
    completed_goals_today: int
    completion_rate_percent: int
    total_study_hours_this_week: float
    consecutive_days_streak: int
    goals: List[UserGoalOut]
    recent_logs: List[StudyLogOut]
