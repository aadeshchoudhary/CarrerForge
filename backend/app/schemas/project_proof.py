"""
Schemas for Project-to-Proof System (Module 3.14).
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field


class ProjectCatalogOut(BaseModel):
    id: str
    title: str
    role_category: str
    difficulty: str
    objective: str
    requirements_checklist: List[str]
    skills_targeted: List[str]
    estimated_hours: int
    rubric_guidelines: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectSubmissionCreate(BaseModel):
    project_catalog_id: Optional[str] = None
    title: str = Field(..., min_length=3, max_length=200)
    github_url: str = Field(..., min_length=10, max_length=500, description="Valid GitHub repository URL")
    live_demo_url: Optional[str] = None
    description: str = Field(..., min_length=20, max_length=2000)
    skills_demonstrated: List[str] = Field(default_factory=list)


class ProjectSubmissionOut(BaseModel):
    id: str
    user_id: str
    project_catalog_id: Optional[str] = None
    title: str
    github_url: str
    live_demo_url: Optional[str] = None
    description: str
    skills_demonstrated: List[str]
    verification_status: str
    verification_notes: Optional[str] = None
    submitted_at: datetime
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True
