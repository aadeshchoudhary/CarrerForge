"""
Schemas for Training Resource Hub (Module 3.11).
"""
from typing import Optional, List
from pydantic import BaseModel


class LearningResourceOut(BaseModel):
    id: str
    title: str
    skill_normalized: str
    resource_type: str
    provider: str
    url: str
    difficulty: str
    estimated_hours: int
    is_free: bool
    language: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ResourceSearchParams(BaseModel):
    skill: Optional[str] = None
    resource_type: Optional[str] = None
    difficulty: Optional[str] = None
    language: Optional[str] = None
    is_free_only: Optional[bool] = False
