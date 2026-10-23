"""
Authentication routes: Register, Login, Current User inspection.
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, CareerID, PrivacySetting
from app.schemas.auth import UserRegister, UserLogin, Token, UserOut
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user, allocate a unique Career ID handle (@handle),
    and initialize default privacy settings.
    """
    # 1. Check if email already registered
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # 2. Check if Career ID handle already claimed
    clean_handle = user_in.handle.strip().lstrip("@").lower()
    existing_handle = db.query(CareerID).filter(CareerID.handle == f"@{clean_handle}").first()
    if existing_handle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The handle @{clean_handle} is already taken. Please choose another."
        )

    # 3. Create User
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        role="student"
    )
    db.add(new_user)
    db.flush()  # Populates new_user.id

    # 4. Create associated Career ID profile
    new_career_id = CareerID(
        user_id=new_user.id,
        handle=f"@{clean_handle}",
        full_name=user_in.full_name,
        target_role=user_in.target_role or "Full Stack Developer",
        xp_points=150,  # Welcome bonus XP
        current_level=1,
        badges_count=1  # Earns 'First Step' badge on signup
    )
    db.add(new_career_id)

    # 5. Create default Privacy settings
    new_privacy = PrivacySetting(
        user_id=new_user.id,
        show_email=False,
        show_skills=True,
        show_resume=False,
        show_gap_scores=True,
        show_activity=True
    )
    db.add(new_privacy)

    db.commit()
    db.refresh(new_user)

    # 6. Generate access token
    access_token = create_access_token(
        subject=new_user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        handle=new_career_id.handle,
        user_id=new_user.id
    )


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning JWT token."""
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated.")

    career = db.query(CareerID).filter(CareerID.user_id == user.id).first()
    handle = career.handle if career else "@user"

    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        handle=handle,
        user_id=user.id
    )


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Fetch logged in user profile identity."""
    return current_user
