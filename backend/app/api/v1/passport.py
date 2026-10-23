"""
Career Passport Endpoints (Module 4.17).
Provides verifiable, shareable proof-of-work overview for mentors, recruiters, and peers.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, CareerID
from app.schemas.passport import CareerPassportOut
from app.services.passport_service import compile_career_passport
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("/me", response_model=CareerPassportOut)
def get_my_passport(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the authenticated candidate's compiled Career Passport."""
    return compile_career_passport(current_user.id, db)


@router.get("/verify/{handle}", response_model=CareerPassportOut)
def verify_public_passport(
    handle: str,
    db: Session = Depends(get_db)
):
    """
    Public QR verification endpoint for prospective employers and mentors.
    Validates candidate's verified code repositories and assessed skills.
    """
    clean_handle = handle if handle.startswith("@") else f"@{handle}"
    career = db.query(CareerID).filter(CareerID.handle == clean_handle).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career Passport not found for this handle.")

    return compile_career_passport(career.user_id, db)
