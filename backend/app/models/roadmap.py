"""
Career Roadmap and Roadmap Milestone Models.
Represents personalized, adaptive learning paths for candidates.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role_target = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    total_milestones = Column(Integer, default=0)
    completed_milestones = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    items = relationship("RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapItem.order_index")


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id"), nullable=False)
    phase_title = Column(String(100), nullable=False)  # e.g. "Phase 1: Foundations", "Phase 2: Core Engineering"
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    skills_targeted = Column(JSON, default=list)       # e.g. ["Python", "FastAPI"]
    resource_recommendations = Column(JSON, default=list)  # Suggested learning resources
    is_project_milestone = Column(Boolean, default=False)
    status = Column(String(20), default="pending")     # pending, in_progress, completed
    order_index = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)

    roadmap = relationship("Roadmap", back_populates="items")
