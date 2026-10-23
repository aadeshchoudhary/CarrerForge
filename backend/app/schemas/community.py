"""
Pydantic response and request models for Phase 4: Community, Feed, Peer Connect & Mentorship.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


# Comments
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=2, max_length=1500)


class CommentOut(BaseModel):
    id: str
    post_id: str
    user_id: str
    author_name: str
    author_handle: str
    content: str
    is_helpful_answer: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Posts
class PostCreate(BaseModel):
    title: str = Field(..., min_length=4, max_length=200)
    content: str = Field(..., min_length=10)
    topic: str = Field("Web Dev", description="Web Dev, AI & ML, Data Science, Internships, Projects, Interview Prep")
    post_type: str = Field("technical_tip", description="milestone, project_showcase, technical_tip, question, collaboration")
    project_link: Optional[str] = None
    passport_link: Optional[str] = None


class PostOut(BaseModel):
    id: str
    user_id: str
    author_name: str
    author_handle: str
    author_headline: Optional[str] = None
    author_badges_count: int = 1
    title: str
    content: str
    topic: str
    post_type: str
    project_link: Optional[str] = None
    passport_link: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    has_liked: bool = False
    created_at: datetime
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True


# Peer Directory & Mentorship
class PeerProfileOut(BaseModel):
    user_id: str
    handle: str
    full_name: str
    headline: str
    target_role: str
    reputation_score: int
    badges_count: int
    verified_skills: List[str]
    connection_status: str  # none, pending, connected
    bio: Optional[str] = None

    class Config:
        from_attributes = True


class ConnectionRequest(BaseModel):
    recipient_id: str


class ConnectionOut(BaseModel):
    id: str
    peer_id: str
    peer_name: str
    peer_handle: str
    peer_role: str
    status: str
    created_at: datetime


# Direct Messaging
class DirectMessageCreate(BaseModel):
    receiver_id: str
    content: str = Field(..., min_length=1, max_length=3000)


class DirectMessageOut(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    sender_handle: str
    receiver_id: str
    content: str
    is_read: bool
    sent_at: datetime

    class Config:
        from_attributes = True


# Study Groups
class StudyGroupCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    topic: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=10, max_length=800)


class StudyGroupOut(BaseModel):
    id: str
    name: str
    topic: str
    description: str
    creator_name: str
    members_count: int
    is_member: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Community Stats
class CommunityStatsOut(BaseModel):
    total_posts: int
    active_discussions: int
    study_groups_count: int
    active_mentors_count: int
    user_reputation: int
    user_connections_count: int
