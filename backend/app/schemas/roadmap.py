"""
Schemas for Dynamic Career Roadmap Generator (Module 2.7).
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class RoadmapItemOut(BaseModel):
    id: str
    phase_title: str
    title: str
    description: str
    skills_targeted: List[str]
    resource_recommendations: List[Dict[str, Any]]
    is_project_milestone: bool
    status: str
    order_index: int
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RoadmapOut(BaseModel):
    id: str
    user_id: str
    role_target: str
    title: str
    description: Optional[str] = None
    total_milestones: int
    completed_milestones: int
    progress_percentage: int
    items: List[RoadmapItemOut]
    created_at: datetime

    class Config:
        from_attributes = True


class RoadmapGenerateRequest(BaseModel):
    target_role: Optional[str] = None
    focus_missing_skills: Optional[List[str]] = []
