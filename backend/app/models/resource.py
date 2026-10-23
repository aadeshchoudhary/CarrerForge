"""
Learning Resources Model for Training Resource Hub.
Stores curated tutorials, courses, documentation, and practice links.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    skill_normalized = Column(String(100), index=True, nullable=False)
    resource_type = Column(String(50), nullable=False)  # documentation, youtube, course, coding_practice, project_tutorial
    provider = Column(String(100), nullable=False)       # MDN, freeCodeCamp, Coursera, FastAPI Docs, YouTube
    url = Column(String(500), nullable=False)
    difficulty = Column(String(30), default="Beginner")  # Beginner, Intermediate, Advanced
    estimated_hours = Column(Integer, default=5)
    is_free = Column(Boolean, default=True)
    language = Column(String(20), default="English")     # English, Hindi
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
