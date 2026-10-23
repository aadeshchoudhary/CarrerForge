"""
Skill Taxonomy and User Skills models.
Crucial rule: Skills are always labeled with their evidence level:
- resume_mentioned: Found in uploaded resume text
- self_reported: Added manually by user in form
- assessed: Validated through a quiz or platform assessment
- verified: Independently confirmed through code commit / project review
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, index=True, nullable=False)
    normalized_name = Column(String(100), index=True, nullable=False)
    category = Column(String(50), default="Technical")  # Frontend, Backend, Database, Cloud, Soft Skill
    description = Column(String(255), nullable=True)

    user_skills = relationship("UserSkill", back_populates="skill")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    
    # Evidence level tracking (Non-negotiable requirement #3)
    evidence_level = Column(String(50), default="resume_mentioned")
    years_experience = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")
