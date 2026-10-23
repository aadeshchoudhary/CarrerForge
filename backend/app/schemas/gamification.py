"""
Schemas for Badges, Quests, and Leaderboards (Module 4.18 & 4.19).
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class BadgeOut(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    category: str
    icon_name: str
    xp_reward: int
    criteria_rule: str
    is_unlocked: bool = False
    awarded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LeaderboardUserOut(BaseModel):
    rank: int
    handle: str
    full_name: str
    target_role: str
    level: int
    weekly_xp: int
    total_xp: int
    verified_projects_count: int
    badges_count: int
    is_current_user: bool = False


class LeaderboardSummaryOut(BaseModel):
    current_user_rank: int
    rankings: List[LeaderboardUserOut]
    total_participants: int
    disclaimer: str = "Leaderboards reward learning consistency and problem-solving practice. Assessed skills and code repository proof remain distinct."
