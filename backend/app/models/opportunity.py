"""
Opportunity Command Center, Company Explorer, AI Interview Gym, and Tech Trends Models (Phase 5).
Features:
- JobApplication (Kanban tracker: saved, applied, screening, interview, offer, rejected)
- Company (Tech stack, hiring status, interview rounds & insights)
- InterviewSession (Interactive Q&A simulation, AI rubric score 0-10, strengths, improvements)
- TechTrend (Demand growth, market adoption, salary benchmarks, skill pairings)
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    company_name = Column(String(150), nullable=False)
    job_title = Column(String(150), nullable=False)
    stage = Column(String(50), default="applied")  # saved, applied, screening, interview, offer, rejected
    location = Column(String(100), default="Remote / Hybrid")
    salary_range = Column(String(100), nullable=True)  # e.g. "₹6 - 10 LPA" or "$80k"
    job_url = Column(String(500), nullable=True)
    applied_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    next_interview_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    match_score = Column(Float, default=80.0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="job_applications")


class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), unique=True, nullable=False)
    industry = Column(String(100), default="Software & Internet")
    location = Column(String(150), default="Bengaluru / Remote")
    website = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    tech_stack = Column(Text, nullable=False)  # JSON or comma-separated list
    hiring_status = Column(String(100), default="Actively Hiring")  # Actively Hiring, Campus Drives Open, Remote Friendly
    typical_interview_rounds = Column(Text, nullable=True)
    interview_tips = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    role_title = Column(String(100), nullable=False)  # Full Stack Developer, ML Engineer, Data Analyst, Cloud Associate
    interview_type = Column(String(50), default="technical")  # technical, behavioral, system_design
    question_text = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=False)
    ai_score = Column(Float, default=7.5)  # 0 to 10
    strengths = Column(Text, nullable=False)
    areas_for_improvement = Column(Text, nullable=False)
    suggested_answer = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="interview_sessions")


class TechTrend(Base):
    __tablename__ = "tech_trends"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50), default="Language")  # Language, Framework, Cloud/DevOps, AI/ML, Database
    demand_growth = Column(String(50), default="+35% YoY")
    market_adoption = Column(String(50), default="High")  # High, Rapid Growth, Explosive Growth
    avg_salary_inr = Column(String(50), default="₹8 - 16 LPA")
    open_roles_count = Column(Integer, default=1200)
    top_pairing_skills = Column(String(200), default="Docker, Git, SQL")
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
