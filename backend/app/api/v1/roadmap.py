"""
Career Roadmap Endpoints (Module 2.7).
Manages adaptive, milestone-based learning plans.
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, CareerID
from app.models.roadmap import Roadmap, RoadmapItem
from app.models.skill import UserSkill, Skill
from app.schemas.roadmap import RoadmapOut, RoadmapItemOut, RoadmapGenerateRequest
from app.services.roadmap_service import build_personalized_roadmap
from app.api.v1.deps import get_current_user

router = APIRouter()


def _format_roadmap_response(roadmap: Roadmap) -> RoadmapOut:
    total = len(roadmap.items)
    completed = sum(1 for item in roadmap.items if item.status == "completed")
    pct = int((completed / total) * 100) if total > 0 else 0

    return RoadmapOut(
        id=roadmap.id,
        user_id=roadmap.user_id,
        role_target=roadmap.role_target,
        title=roadmap.title,
        description=roadmap.description,
        total_milestones=total,
        completed_milestones=completed,
        progress_percentage=pct,
        items=[RoadmapItemOut.model_validate(item) for item in roadmap.items],
        created_at=roadmap.created_at
    )


@router.get("/active", response_model=RoadmapOut)
def get_active_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the candidate's active roadmap. Generates one if none exists."""
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == current_user.id)
        .order_by(Roadmap.created_at.desc())
        .first()
    )

    if not roadmap:
        career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
        target_role = career.target_role if career else "Full Stack Developer"
        return generate_roadmap(RoadmapGenerateRequest(target_role=target_role), current_user, db)

    return _format_roadmap_response(roadmap)


@router.post("/generate", response_model=RoadmapOut)
def generate_roadmap(
    request: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate or regenerate an adaptive learning roadmap."""
    career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
    target_role = request.target_role or (career.target_role if career else "Full Stack Developer")

    # Get user's confirmed skills
    user_skills_records = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    user_skills = []
    for us in user_skills_records:
        s = db.query(Skill).filter(Skill.id == us.skill_id).first()
        if s:
            user_skills.append(s.name)

    items_data = build_personalized_roadmap(target_role, user_skills)

    new_roadmap = Roadmap(
        user_id=current_user.id,
        role_target=target_role,
        title=f"{target_role} Mastery Roadmap",
        description=f"Structured, milestone-based learning curriculum tailored to your background in {target_role}."
    )
    db.add(new_roadmap)
    db.flush()

    for item in items_data:
        db_item = RoadmapItem(
            roadmap_id=new_roadmap.id,
            phase_title=item["phase_title"],
            title=item["title"],
            description=item["description"],
            skills_targeted=item["skills_targeted"],
            resource_recommendations=item["resource_recommendations"],
            is_project_milestone=item["is_project_milestone"],
            status=item["status"],
            order_index=item["order_index"],
            completed_at=datetime.now(timezone.utc) if item["status"] == "completed" else None
        )
        db.add(db_item)

    db.commit()
    db.refresh(new_roadmap)
    return _format_roadmap_response(new_roadmap)


@router.put("/items/{item_id}/toggle", response_model=RoadmapItemOut)
def toggle_roadmap_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle a roadmap milestone between pending and completed. Awards XP on completion."""
    item = (
        db.query(RoadmapItem)
        .join(Roadmap)
        .filter(RoadmapItem.id == item_id, Roadmap.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap milestone not found.")

    if item.status == "completed":
        item.status = "pending"
        item.completed_at = None
    else:
        item.status = "completed"
        item.completed_at = datetime.now(timezone.utc)
        # Award +30 XP for milestone completion
        career = db.query(CareerID).filter(CareerID.user_id == current_user.id).first()
        if career:
            career.xp_points += 30

    db.commit()
    db.refresh(item)
    return item
