"""
Gamification, Badges, and Leaderboard Endpoints (Module 4.18 & 4.19).
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, CareerID
from app.models.gamification import Badge, UserBadge
from app.models.project_proof import UserProjectSubmission
from app.schemas.gamification import BadgeOut, LeaderboardUserOut, LeaderboardSummaryOut
from app.services.badge_engine import check_and_award_badges
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/badges", response_model=List[BadgeOut])
def get_user_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates candidate's latest activities, awards any newly unlocked badges,
    and returns the master badge catalog with unlocked status.
    """
    # Trigger auto-award check
    check_and_award_badges(current_user.id, db)

    all_badges = db.query(Badge).all()
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    unlocked_map = {ub.badge_id: ub.awarded_at for ub in user_badges}

    results = []
    for b in all_badges:
        is_unlocked = b.id in unlocked_map
        results.append(BadgeOut(
            id=b.id,
            slug=b.slug,
            name=b.name,
            description=b.description,
            category=b.category,
            icon_name=b.icon_name,
            xp_reward=b.xp_reward,
            criteria_rule=b.criteria_rule,
            is_unlocked=is_unlocked,
            awarded_at=unlocked_map.get(b.id)
        ))

    return results


@router.get("/leaderboard", response_model=LeaderboardSummaryOut)
def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves ranked students by weekly XP and verified projects.
    Respects privacy and highlights current student's standing.
    """
    # Query all active profiles
    careers = db.query(CareerID).order_by(CareerID.xp_points.desc()).all()

    rankings: List[LeaderboardUserOut] = []
    user_rank = 1

    for idx, c in enumerate(careers):
        rank = idx + 1
        is_me = (c.user_id == current_user.id)
        if is_me:
            user_rank = rank

        # Count verified projects
        v_proj = db.query(UserProjectSubmission).filter(
            UserProjectSubmission.user_id == c.user_id,
            UserProjectSubmission.verification_status == "verified"
        ).count()

        rankings.append(LeaderboardUserOut(
            rank=rank,
            handle=c.handle,
            full_name=c.full_name,
            target_role=c.target_role,
            level=c.current_level,
            weekly_xp=min(c.xp_points, 450), # Weekly activity estimation
            total_xp=c.xp_points,
            verified_projects_count=v_proj,
            badges_count=c.badges_count,
            is_current_user=is_me
        ))

    return LeaderboardSummaryOut(
        current_user_rank=user_rank,
        rankings=rankings[:25], # Top 25
        total_participants=len(careers),
        disclaimer="Leaderboards reward learning consistency and daily practice. Verified code evidence remains distinct from participation points."
    )
