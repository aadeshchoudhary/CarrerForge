"""
Profile, Career ID, and Privacy Pydantic schemas.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CareerIDOut(BaseModel):
    id: str
    user_id: str
    handle: str
    full_name: str
    headline: str
    bio: str
    target_role: str
    xp_points: int
    current_level: int
    badges_count: int
    visibility: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=150)
    headline: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    target_role: Optional[str] = Field(None, max_length=100)
    visibility: Optional[str] = Field(None, pattern="^(public|private)$")


class PrivacySettingsOut(BaseModel):
    show_email: bool
    show_skills: bool
    show_resume: bool
    show_gap_scores: bool
    show_activity: bool

    class Config:
        from_attributes = True


class PrivacySettingsUpdate(BaseModel):
    show_email: Optional[bool] = None
    show_skills: Optional[bool] = None
    show_resume: Optional[bool] = None
    show_gap_scores: Optional[bool] = None
    show_activity: Optional[bool] = None
