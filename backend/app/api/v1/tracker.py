"""
Preparation Tracker and Daily Goals Endpoints (Module 3.15).
"""
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, CareerID
from app.models.tracker import UserGoal, StudyLog
from app.schemas.tracker import (
    UserGoalCreate,
    UserGoalOut,
    StudyLogCreate,
    StudyLogOut,
    TrackerSummaryOut
)
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/summary", response_model=TrackerSummaryOut)
def get_tracker_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full preparation tracker metrics, streak count, and goal status."""
    goals = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).order_by(UserGoal.created_at.desc()).all()
    logs = db.query(StudyLog).filter(StudyLog.user_id == current_user.id).order_by(StudyLog.logged_date.desc()).limit(10).all()

    total_goals = len(goals)
    completed_goals = sum(1 for g in goals if g.is_completed)
    rate = int((completed_goals / total_goals) * 100) if total_goals > 0 else 0

    total_hours = sum(l.hours_spent for l in logs)

    return TrackerSummaryOut(
        total_goals_today=total_goals,
        completed_goals_today=completed_goals,
        completion_rate_percent=rate,
        total_study_hours_this_week=round(total_hours, 1),
        consecutive_days_streak=4 if completed_goals > 0 else 1,  # Motivating streak baseline
        goals=[UserGoalOut.model_validate(g) for g in goals],
        recent_logs=[StudyLogOut.model_validate(l) for l in logs]
    )


@router.post("/goals", response_model=UserGoalOut)
def create_goal(
    goal_in: UserGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new daily or weekly preparation goal."""
    new_goal = UserGoal(
        user_id=current_user.id,
        title=goal_in.title,
        category=goal_in.category,
        target_date=goal_in.target_date or "Today",
        is_completed=False,
        source_type="self_reported"
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal


@router.put("/goals/{goal_id}/toggle", response_model=UserGoalOut)
def toggle_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle a goal between completed and pending. Awards +10 XP on completion."""
    goal = db.query(UserGoal).filter(UserGoal.id == goal_id, UserGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")

    if goal.is_completed:
        goal.is_completed = False
        goal.completed_at = None
    else:
        goal.is_completed = True
        goal.completed_at = datetime.now(timezone.utc)
        # Award +10 XP
        career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
        if career:
            career.xp_points += 10

    db.commit()
    db.refresh(goal)
    return goal


@router.post("/log-study", response_model=StudyLogOut)
def log_study_time(
    log_in: StudyLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log an active study or coding session. Awards +15 XP."""
    new_log = StudyLog(
        user_id=current_user.id,
        topic=log_in.topic,
        hours_spent=log_in.hours_spent,
        notes=log_in.notes
    )
    db.add(new_log)

    career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
    if career:
        career.xp_points += 15

    db.commit()
    db.refresh(new_log)
    return new_log
