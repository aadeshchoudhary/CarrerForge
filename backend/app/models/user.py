"""
User, Career ID, and Privacy Settings database models.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # student, mentor, recruiter, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    career_id = relationship("CareerID", back_populates="user", uselist=False, cascade="all, delete-orphan")
    privacy = relationship("PrivacySetting", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    gap_reports = relationship("SkillGapReport", back_populates="user", cascade="all, delete-orphan")


class CareerID(Base):
    __tablename__ = "career_ids"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Handle formatted as @username (e.g. @alex_dev)
    handle = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    headline = Column(String(255), default="Aspiring Software Engineer & Lifelong Learner")
    bio = Column(Text, default="Passionate about learning new technologies, building practical projects, and solving real-world problems.")
    target_role = Column(String(100), default="Full Stack Developer")
    
    # Gamification basics (Phase 1 foundational)
    xp_points = Column(Integer, default=150)
    current_level = Column(Integer, default=1)
    badges_count = Column(Integer, default=1)
    
    visibility = Column(String(20), default="public")  # public, private
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="career_id")


class PrivacySetting(Base):
    __tablename__ = "privacy_settings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    
    show_email = Column(Boolean, default=False)
    show_skills = Column(Boolean, default=True)
    show_resume = Column(Boolean, default=False)
    show_gap_scores = Column(Boolean, default=True)
    show_activity = Column(Boolean, default=True)

    user = relationship("User", back_populates="privacy")
