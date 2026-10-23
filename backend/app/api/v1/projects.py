"""
Project-to-Proof Endpoints (Module 3.14).
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.project_proof import ProjectCatalog, UserProjectSubmission
from app.schemas.project_proof import ProjectCatalogOut, ProjectSubmissionCreate, ProjectSubmissionOut
from app.services.project_verifier import verify_and_submit_project
from app.services.badge_engine import check_and_award_badges
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/catalog", response_model=List[ProjectCatalogOut])
def get_project_catalog(db: Session = Depends(get_db)):
    """Retrieve curated benchmark projects with checklists and targeted skills."""
    return db.query(ProjectCatalog).all()


@router.post("/submit", response_model=ProjectSubmissionOut, status_code=status.HTTP_201_CREATED)
def submit_project_proof(
    submission_data: ProjectSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit GitHub repository proof for practical skills application.
    Validates repository format, upgrades skills to 'verified' evidence level,
    awards +100 XP, and unlocks Project Champion badge.
    """
    try:
        submission = verify_and_submit_project(current_user.id, submission_data, db)
        # Evaluate badges (unlocks Project Champion)
        check_and_award_badges(current_user.id, db)
        return submission
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify project submission: {str(e)}")


@router.get("/my-submissions", response_model=List[ProjectSubmissionOut])
def get_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List current candidate's submitted and verified project repositories."""
    return (
        db.query(UserProjectSubmission)
        .filter(UserProjectSubmission.user_id == current_user.id)
        .order_by(UserProjectSubmission.submitted_at.desc())
        .all()
    )
