"""
Training Resource Hub Endpoints (Module 3.11).
Search and filter curated tutorials, documentation, and practice materials.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.resources import LearningResourceOut
from app.services.resource_curator import search_resources

router = APIRouter()


@router.get("/search", response_model=List[LearningResourceOut])
def get_learning_resources(
    skill: Optional[str] = Query(None, description="Filter by skill, e.g. python, react, sql"),
    resource_type: Optional[str] = Query(None, description="documentation, youtube, course, coding_practice, project_tutorial"),
    difficulty: Optional[str] = Query(None, description="Beginner, Intermediate, Advanced"),
    language: Optional[str] = Query(None, description="English, Hindi"),
    free_only: bool = Query(False, description="Filter only 100% free resources"),
    db: Session = Depends(get_db)
):
    """Search the curated Training Resource Hub with multi-attribute filtering."""
    results = search_resources(
        db=db,
        skill=skill,
        resource_type=resource_type,
        difficulty=difficulty,
        language=language,
        is_free_only=free_only
    )
    return results
