"""
Resume and Parsed Data models.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)  # pdf, docx
    file_path = Column(String(500), nullable=False)
    raw_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="resumes")
    parsed_data = relationship("ParsedResumeData", back_populates="resume", uselist=False, cascade="all, delete-orphan")


class ParsedResumeData(Base):
    __tablename__ = "parsed_resume_data"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id"), unique=True, nullable=False)

    personal_info = Column(JSON, default=dict)       # name, email, phone, location, links
    education = Column(JSON, default=list)           # degree, institution, year, score
    work_experience = Column(JSON, default=list)     # title, company, duration, bullets
    projects = Column(JSON, default=list)            # title, tech_stack, description, link
    certifications = Column(JSON, default=list)      # name, issuer, year
    extracted_skills = Column(JSON, default=list)    # list of skill strings or objects
    
    extraction_confidence = Column(Float, default=0.85)  # 0.0 to 1.0 confidence measure
    extraction_warnings = Column(JSON, default=list)     # list of warning strings e.g. "Missing GPA", "No projects section found"
    
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="parsed_data")
