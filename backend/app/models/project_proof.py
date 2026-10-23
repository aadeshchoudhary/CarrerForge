"""
Project-to-Proof Models (Module 3.14).
Stores recommended benchmark project specifications and candidate code submissions.
Linking projects upgrades skills from 'resume_mentioned' to 'verified'.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class ProjectCatalog(Base):
    __tablename__ = "project_catalog"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    role_category = Column(String(100), nullable=False) # Full Stack Developer, Data Analyst, Machine Learning
    difficulty = Column(String(30), default="Intermediate") # Beginner, Intermediate, Advanced
    objective = Column(Text, nullable=False)
    requirements_checklist = Column(JSON, default=list) # List of required technical checklist tasks
    skills_targeted = Column(JSON, default=list)        # Skills verified upon completion
    estimated_hours = Column(Integer, default=15)
    rubric_guidelines = Column(Text, nullable=True)


class UserProjectSubmission(Base):
    __tablename__ = "user_project_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    project_catalog_id = Column(String(36), ForeignKey("project_catalog.id"), nullable=True)

    title = Column(String(200), nullable=False)
    github_url = Column(String(500), nullable=False)
    live_demo_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    skills_demonstrated = Column(JSON, default=list)
    
    # Verification status: 'submitted', 'verified', 'needs_revision'
    verification_status = Column(String(30), default="verified")
    verification_notes = Column(Text, nullable=True)

    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="project_submissions")
    catalog_item = relationship("ProjectCatalog")
