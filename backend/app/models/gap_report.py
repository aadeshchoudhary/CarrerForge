"""
Job Descriptions and Skill-Gap Reports models.
Implements the explainable, documented weighted coverage scoring engine.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(150), index=True, nullable=False)
    company = Column(String(150), nullable=False)
    location = Column(String(100), default="Remote / Hybrid")
    source_url = Column(String(500), nullable=True)
    description_text = Column(Text, nullable=False)
    
    # Categorized skill expectations
    essential_skills = Column(JSON, default=list)  # e.g. ["Python", "SQL", "FastAPI"]
    preferred_skills = Column(JSON, default=list)  # e.g. ["Docker", "AWS", "Redis"]
    experience_level = Column(String(50), default="Fresher / Entry-Level")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    gap_reports = relationship("SkillGapReport", back_populates="job")


class SkillGapReport(Base):
    __tablename__ = "skill_gap_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("job_descriptions.id"), nullable=False)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=True)

    # Documented weighted formula score (0.0 to 100.0)
    coverage_score = Column(Float, nullable=False)
    
    matched_skills = Column(JSON, default=list)           # Skills found in resume
    missing_essential = Column(JSON, default=list)        # Critical must-haves missing
    missing_preferred = Column(JSON, default=list)        # Nice-to-haves missing
    needs_evidence = Column(JSON, default=list)           # Mentioned, but lack project proof
    
    # Mathematical explanation for Explainable AI
    formula_breakdown = Column(JSON, default=dict)
    improvement_advice = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="gap_reports")
    job = relationship("JobDescription", back_populates="gap_reports")
