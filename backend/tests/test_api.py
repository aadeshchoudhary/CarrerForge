"""
Integration tests for FastAPI endpoints (Auth, Career ID, Benchmark Jobs).
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_benchmark_jobs_seeded():
    response = client.get("/api/v1/skills/jobs/sample")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) >= 4
    titles = [j["title"] for j in jobs]
    assert any("Full Stack" in t for t in titles)
    assert any("Data Analyst" in t for t in titles)


def test_register_and_login_flow():
    user_payload = {
        "email": "test_student@college.edu",
        "password": "strongPassword123",
        "full_name": "Aarav Sharma",
        "handle": "aarav_dev",
        "target_role": "Full Stack Engineer"
    }
    
    # 1. Register
    reg_res = client.post("/api/v1/auth/register", json=user_payload)
    # Could be 201 or 400 if already exists in test run
    if reg_res.status_code == 201:
        data = reg_res.json()
        assert "access_token" in data
        assert data["handle"] == "@aarav_dev"

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "test_student@college.edu",
        "password": "strongPassword123"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    token = login_data["access_token"]

    # 3. Authenticated profile check
    me_res = client.get("/api/v1/profile/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    profile_data = me_res.json()
    assert profile_data["career_id"]["handle"] == "@aarav_dev"
