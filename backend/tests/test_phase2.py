"""
Unit and integration tests for Phase 2 backend features.
(Resume Builder DOCX, Quality Checker, Roadmap Generator, Resource Hub).
"""
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.builder import (
    ResumeBuildRequest,
    PersonalInfoInput,
    EducationInput,
    ExperienceInput,
    ProjectInput
)
from app.services.docx_builder import generate_resume_docx
from app.services.quality_checker import audit_resume_quality
from app.services.roadmap_service import build_personalized_roadmap

client = TestClient(app)


def test_docx_builder_generation():
    req = ResumeBuildRequest(
        personal_info=PersonalInfoInput(
            full_name="Aarav Sharma",
            email="aarav@college.edu",
            phone="+91 9876543210",
            github="github.com/aarav",
            linkedin="linkedin.com/in/aarav"
        ),
        education=[
            EducationInput(degree="B.Tech Computer Science", institution="NIT", year="2024")
        ],
        work_experience=[
            ExperienceInput(
                title="Full Stack Intern",
                company="TechLabs",
                duration="6 Months",
                bullet_points=["Engineered REST APIs with FastAPI and PostgreSQL, reducing latency by 35%."]
            )
        ],
        projects=[
            ProjectInput(
                title="AI Resume Platform",
                tech_stack="React, FastAPI",
                description="Built an end-to-end career platform with explainable skill gap scoring."
            )
        ],
        skills=["Python", "FastAPI", "React", "SQL", "Git"]
    )

    stream = generate_resume_docx(req)
    assert isinstance(stream, io.BytesIO)
    content = stream.getvalue()
    # Word docx zip header is PK\x03\x04
    assert content.startswith(b"PK")
    assert len(content) > 1000


def test_quality_checker_detects_weak_phrasing():
    req = ResumeBuildRequest(
        personal_info=PersonalInfoInput(
            full_name="Test Student",
            email="test@test.com",
            phone="1234567890"
        ),
        education=[],
        work_experience=[
            ExperienceInput(
                title="Intern",
                company="XYZ",
                duration="3 Months",
                bullet_points=["Worked on the website frontend and helped with bugs."]
            )
        ],
        projects=[],
        skills=["HTML", "CSS"]
    )

    report = audit_resume_quality(req)
    assert report.quality_score < 75
    # Should flag 'worked on'
    categories = [i.category for i in report.issues]
    assert "passive_voice" in categories
    assert any("worked on" in (i.title or "").lower() for i in report.issues)


def test_roadmap_generator_adaptive():
    user_skills = ["Python", "JavaScript", "HTML", "CSS", "Tailwind CSS"]
    items = build_personalized_roadmap("Full Stack Developer", user_skills)
    assert len(items) >= 4
    
    # Milestone 1 contains modern JS, HTML, CSS -> should be completed
    first_item = items[0]
    assert first_item["status"] == "completed"
    
    # Capstone project milestone should be pending
    project_item = [i for i in items if i["is_project_milestone"]][0]
    assert project_item["status"] == "pending"


def test_resources_search_endpoint():
    res = client.get("/api/v1/resources/search?skill=python")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert any("Python" in r["title"] for r in data)
