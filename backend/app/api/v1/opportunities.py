"""
Opportunity Command Center, Company Explorer, AI Interview Gym, and Tech Trends API (Phase 5).
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.opportunity import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationOut,
    ApplicationStatsOut,
    CompanyOut,
    InterviewQuestionOut,
    InterviewEvaluationRequest,
    InterviewEvaluationOut,
    TechTrendOut,
)
from app.services import opportunity_service

router = APIRouter()


# -------------------------------------------------------------
# Job Applications & Kanban Tracker
# -------------------------------------------------------------
@router.get("/applications", response_model=List[JobApplicationOut])
def get_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all job applications tracked in the user's Opportunity Command Center.
    """
    return opportunity_service.get_user_applications(
        db=db,
        user_id=current_user.id
    )


@router.post("/applications", response_model=JobApplicationOut, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new job application to the Kanban tracking board (+15 XP).
    """
    return opportunity_service.create_user_application(
        db=db,
        user_id=current_user.id,
        data=app_in
    )


@router.put("/applications/{app_id}", response_model=JobApplicationOut)
def update_application(
    app_id: str,
    app_update: JobApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update application stage, notes, or interview schedule. Awards milestone XP.
    """
    try:
        return opportunity_service.update_user_application(
            db=db,
            user_id=current_user.id,
            application_id=app_id,
            data=app_update
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/applications/{app_id}")
def delete_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove an application from tracking.
    """
    try:
        opportunity_service.delete_user_application(
            db=db,
            user_id=current_user.id,
            application_id=app_id
        )
        return {"status": "deleted", "id": app_id}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/applications/stats", response_model=ApplicationStatsOut)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve aggregated application pipeline metrics for dashboard summary cards.
    """
    return opportunity_service.get_application_stats(
        db=db,
        user_id=current_user.id
    )


# -------------------------------------------------------------
# Company Explorer
# -------------------------------------------------------------
@router.get("/companies", response_model=List[CompanyOut])
def get_companies(
    search: Optional[str] = Query(None, description="Search company or industry"),
    tech: Optional[str] = Query(None, description="Filter by tech stack"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Explore hiring companies, technology stacks, and insider interview guidance.
    """
    return opportunity_service.get_companies(
        db=db,
        search=search,
        tech_filter=tech
    )


# -------------------------------------------------------------
# AI Interview Gym
# -------------------------------------------------------------
@router.get("/interview/questions", response_model=List[InterviewQuestionOut])
def get_questions(
    role: str = Query("Full Stack Developer", description="Target role"),
    interview_type: str = Query("technical", description="technical, behavioral, or system_design"),
    current_user: User = Depends(get_current_user)
):
    """
    Get realistic benchmark interview questions with hints for targeted role.
    """
    return opportunity_service.get_interview_questions(
        role_title=role,
        interview_type=interview_type
    )


@router.post("/interview/evaluate", response_model=InterviewEvaluationOut)
def evaluate_interview(
    eval_req: InterviewEvaluationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluate interview response with transparent rubrics, strengths, gaps, and sample optimal answer (+20 XP).
    """
    return opportunity_service.evaluate_interview_answer(
        db=db,
        user_id=current_user.id,
        req=eval_req
    )


# -------------------------------------------------------------
# Technology Trends
# -------------------------------------------------------------
@router.get("/trends", response_model=List[TechTrendOut])
def get_trends(
    category: Optional[str] = Query(None, description="Language, Framework, Cloud/DevOps, AI/ML, Database"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Real-time technology demand trends, market growth, salary benchmarks, and pairing skills.
    """
    return opportunity_service.get_tech_trends(
        db=db,
        category=category
    )
