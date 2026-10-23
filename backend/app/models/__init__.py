"""
Export all models for SQLAlchemy registry.
"""
from app.models.user import User, CareerID, PrivacySetting
from app.models.resume import Resume, ParsedResumeData
from app.models.skill import Skill, UserSkill
from app.models.gap_report import JobDescription, SkillGapReport
from app.models.roadmap import Roadmap, RoadmapItem
from app.models.resource import LearningResource
from app.models.tracker import UserGoal, StudyLog
from app.models.project_proof import ProjectCatalog, UserProjectSubmission
from app.models.gamification import Badge, UserBadge
from app.models.community import (
    Post,
    PostLike,
    Comment,
    Connection,
    DirectMessage,
    StudyGroup,
    UserStudyGroup,
)
from app.models.opportunity import (
    JobApplication,
    Company,
    InterviewSession,
    TechTrend,
)

__all__ = [
    "User",
    "CareerID",
    "PrivacySetting",
    "Resume",
    "ParsedResumeData",
    "Skill",
    "UserSkill",
    "JobDescription",
    "SkillGapReport",
    "Roadmap",
    "RoadmapItem",
    "LearningResource",
    "UserGoal",
    "StudyLog",
    "ProjectCatalog",
    "UserProjectSubmission",
    "Badge",
    "UserBadge",
    "Post",
    "PostLike",
    "Comment",
    "Connection",
    "DirectMessage",
    "StudyGroup",
    "UserStudyGroup",
    "JobApplication",
    "Company",
    "InterviewSession",
    "TechTrend",
]
