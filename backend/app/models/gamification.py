"""
Gamification Models: Badges, XP Quests, and Leaderboards (Module 4.18 & 4.19).
Published criteria ensure participation points remain distinct from demonstrated ability.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Badge(Base):
    __tablename__ = "badges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(50), unique=True, index=True, nullable=False) # e.g. first_step, project_champion
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    category = Column(String(50), default="milestone") # milestone, skill, consistency, proof
    icon_name = Column(String(50), default="Award")
    xp_reward = Column(Integer, default=50)
    criteria_rule = Column(Text, nullable=False)


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    badge_id = Column(String(36), ForeignKey("badges.id"), nullable=False)
    awarded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    badge = relationship("Badge")
    user = relationship("User", backref="badges")
