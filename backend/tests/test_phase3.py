"""
Unit and integration tests for Phase 3 backend features.
(Project-to-Proof, Career Passport, Badge Engine, Leaderboard).
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.user import User, CareerID
from app.models.project_proof import ProjectCatalog
from app.models.skill import UserSkill, Skill
from app.schemas.project_proof import ProjectSubmissionCreate
from app.services.project_verifier import verify_and_submit_project
from app.services.badge_engine import check_and_award_badges
from app.services.passport_service import compile_career_passport

client = TestClient(app)


def test_project_proof_verification_promotes_skills():
    db = SessionLocal()
    # Find or create a test student
    user = db.query(User).filter(User.email == "test_student@college.edu").first()
    if not user:
        user = User(email="test_proof_student@college.edu", hashed_password="hashed_dummy_password")
        db.add(user)
        db.commit()
        db.refresh(user)

    submission_data = ProjectSubmissionCreate(
        title="Full-Stack Web App",
        github_url="https://github.com/aarav-sharma/career-platform",
        live_demo_url="https://careerforge.demo",
        description="Built modern web application with FastAPI and React, deploying PostgreSQL database containers.",
        skills_demonstrated=["FastAPI", "React", "Docker"]
    )

    submission = verify_and_submit_project(user.id, submission_data, db)
    assert submission.verification_status == "verified"

    # Check that FastAPI skill is now verified
    fastapi_skill = db.query(Skill).filter(Skill.normalized_name == "fastapi").first()
    assert fastapi_skill is not None
    user_skill = db.query(UserSkill).filter(
        UserSkill.user_id == user.id,
        UserSkill.skill_id == fastapi_skill.id
    ).first()
    assert user_skill is not None
    assert user_skill.evidence_level == "verified"
    db.close()


def test_badge_engine_awards_badges():
    db = SessionLocal()
    user = db.query(User).filter(User.email == "test_student@college.edu").first()
    assert user is not None

    awarded = check_and_award_badges(user.id, db)
    # User should at least have 'first_step' unlocked
    from app.models.gamification import UserBadge
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user.id).all()
    assert len(user_badges) >= 1
    db.close()


def test_career_passport_compilation():
    db = SessionLocal()
    user = db.query(User).filter(User.email == "test_student@college.edu").first()
    assert user is not None

    passport = compile_career_passport(user.id, db)
    assert passport.passport_id.startswith("CF-PASS-")
    assert len(passport.verification_hash) == 16
    assert passport.verification_url.startswith("http")
    assert isinstance(passport.verified_skills, list)
    assert isinstance(passport.verified_projects, list)
    db.close()


def test_leaderboard_endpoint():
    res = client.get("/api/v1/gamification/leaderboard", headers={
        # Mock bearer token login or demo
    })
    # Even without auth header, endpoint should require auth or allow
    # Let's test with login token
    login_res = client.post("/api/v1/auth/login", json={
        "email": "test_student@college.edu",
        "password": "strongPassword123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    lead_res = client.get("/api/v1/gamification/leaderboard", headers={"Authorization": f"Bearer {token}"})
    assert lead_res.status_code == 200
    lead_data = lead_res.json()
    assert "rankings" in lead_data
    assert len(lead_data["rankings"]) >= 1
    assert lead_data["current_user_rank"] >= 1
