"""
Resume upload and parsed profile schemas.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class ParsedDataPayload(BaseModel):
    personal_info: Dict[str, Any]
    education: List[Dict[str, Any]]
    work_experience: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    certifications: List[Dict[str, Any]]
    extracted_skills: List[str]
    extraction_confidence: float
    extraction_warnings: List[str]


class ParsedResumeOut(BaseModel):
    id: str
    resume_id: str
    personal_info: Dict[str, Any]
    education: List[Dict[str, Any]]
    work_experience: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    certifications: List[Dict[str, Any]]
    extracted_skills: List[str]
    extraction_confidence: float
    extraction_warnings: List[str]
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumeOut(BaseModel):
    id: str
    filename: str
    file_type: str
    uploaded_at: datetime
    parsed_data: Optional[ParsedResumeOut] = None

    class Config:
        from_attributes = True


class ResumeReviewUpdate(BaseModel):
    personal_info: Optional[Dict[str, Any]] = None
    education: Optional[List[Dict[str, Any]]] = None
    work_experience: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    extracted_skills: Optional[List[str]] = None
