"""
Schemas for Career Passport (Module 4.17).
Provides a tamper-evident, verifiable overview of candidate achievements.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class PassportSkillItem(BaseModel):
    name: string if False else str
    category: str
    evidence_level: str


class PassportProjectItem(BaseModel):
    title: str
    github_url: str
    live_demo_url: Optional[str] = None
    skills_demonstrated: List[str]
    verification_status: str


class PassportBadgeItem(BaseModel):
    name: str
    slug: str
    description: str
    icon_name: str
    awarded_at: datetime


class CareerPassportOut(BaseModel):
    passport_id: str
    handle: str
    full_name: str
    headline: str
    target_role: str
    level: int
    total_xp: int
    verified_projects_count: int
    verified_skills: List[PassportSkillItem]
    assessed_skills: List[PassportSkillItem]
    resume_mentioned_skills: List[PassportSkillItem]
    verified_projects: List[PassportProjectItem]
    earned_badges: List[PassportBadgeItem]
    verification_hash: str
    verification_url: str
    generated_at: datetime
    disclaimer: str = "This Career Passport provides verified proof-of-work and assessment credentials. User-reported skills are explicitly categorized."
