"""
Preparation Tracker and Daily Goals Models.
Enables candidates to log study hours and set daily/weekly milestones.
Differentiates between self-reported tasks and milestone-verified tasks.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Float
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class UserGoal(Base):
    __tablename__ = "user_goals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="study")  # study, project, quiz, application
    target_date = Column(String(50), nullable=True) # e.g. "Today", "This Week"
    is_completed = Column(Boolean, default=False)
    source_type = Column(String(50), default="self_reported") # self_reported, milestone_confirmed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)


class StudyLog(Base):
    __tablename__ = "study_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    topic = Column(String(150), nullable=False)
    hours_spent = Column(Float, default=1.0)
    notes = Column(Text, nullable=True)
    logged_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
