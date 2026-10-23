"""
Schemas for Resume Builder and Quality Checker (Module 1.3 & 1.4).
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PersonalInfoInput(BaseModel):
    full_name: str
    email: str
    phone: str
    location: Optional[str] = "Bengaluru, India"
    headline: Optional[str] = "Software Developer"
    github: Optional[str] = ""
    linkedin: Optional[str] = ""
    portfolio: Optional[str] = ""


class EducationInput(BaseModel):
    degree: str
    institution: str
    year: str
    score: Optional[str] = "First Class"


class ExperienceInput(BaseModel):
    title: str
    company: str
    duration: str
    location: Optional[str] = ""
    bullet_points: List[str] = []


class ProjectInput(BaseModel):
    title: str
    tech_stack: str
    description: str
    github_link: Optional[str] = ""
    live_link: Optional[str] = ""


class ResumeBuildRequest(BaseModel):
    personal_info: PersonalInfoInput
    education: List[EducationInput]
    work_experience: List[ExperienceInput]
    projects: List[ProjectInput]
    skills: List[str]
    certifications: Optional[List[str]] = []
    target_job_title: Optional[str] = "Software Engineer"


class QualityIssue(BaseModel):
    id: str
    category: str      # 'weak_bullet', 'missing_metrics', 'passive_voice', 'missing_section', 'formatting'
    severity: str      # 'high', 'medium', 'low'
    title: str
    description: str
    target_text: Optional[str] = None
    suggested_rewrite: Optional[str] = None


class QualityCheckResponse(BaseModel):
    quality_score: int  # 0 to 100
    grade: str          # 'A', 'B', 'C', 'Needs Improvement'
    action_verbs_score: int
    quantifiable_metrics_score: int
    completeness_score: int
    issues: List[QualityIssue]
    strengths: List[str]
    disclaimer: str = "This analysis highlights actionable readability and structure enhancements. It does not promise guaranteed ATS passage or official employer hiring decisions."
