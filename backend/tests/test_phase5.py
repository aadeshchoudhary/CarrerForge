"""
Unit and integration tests for Phase 5 backend features:
- Opportunity Command Center (Application Kanban Tracking & Pipeline Stats)
- Company Explorer (Tech Stack & Interview Tips)
- AI Interview Gym (Question Retrieval & Explainable Rubric Evaluation)
- Technology Market Trends & Benchmark Salaries
"""
import pytest
from app.core.database import SessionLocal
from app.models.user import User, CareerID
from app.schemas.opportunity import (
    JobApplicationCreate,
    JobApplicationUpdate,
    InterviewEvaluationRequest,
)
from app.services.opportunity_service import (
    get_user_applications,
    create_user_application,
    update_user_application,
    delete_user_application,
    get_application_stats,
    get_companies,
    get_interview_questions,
    evaluate_interview_answer,
    get_tech_trends,
)


def get_test_user(db, email="test_phase5_user@college.edu", handle="@test_phase5"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, hashed_password="hashed_dummy_password")
        db.add(user)
        db.flush()
        cid = CareerID(
            user_id=user.id,
            handle=handle,
            full_name="Phase 5 Candidate",
            target_role="Full Stack Developer",
            xp_points=350,
            badges_count=3
        )
        db.add(cid)
        db.commit()
        db.refresh(user)
    return user


def test_job_application_lifecycle_and_stats():
    db = SessionLocal()
    user = get_test_user(db)

    # 1. Create Application
    app_data = JobApplicationCreate(
        company_name="Google Cloud APAC",
        job_title="Associate Cloud Software Engineer",
        stage="applied",
        location="Bengaluru",
        salary_range="₹14 - 22 LPA",
        notes="Applied via campus portal with verified Career Passport link",
        match_score=88.5
    )
    created = create_user_application(db, user.id, app_data)
    assert created.company_name == app_data.company_name
    assert created.stage == "applied"
    assert created.salary_range == "₹14 - 22 LPA"

    # 2. Advance Stage to Interview
    update_data = JobApplicationUpdate(
        stage="interview",
        notes="Technical Round 1 scheduled: System Design & Microservices"
    )
    updated = update_user_application(db, user.id, created.id, update_data)
    assert updated.stage == "interview"

    # 3. Check Pipeline Stats
    stats = get_application_stats(db, user.id)
    assert stats.total_applications >= 1
    assert stats.interview_count >= 1

    # 4. Cleanup
    deleted = delete_user_application(db, user.id, created.id)
    assert deleted is True

    db.close()


def test_company_explorer_and_tech_filters():
    db = SessionLocal()
    # 1. Fetch all seeded companies
    companies = get_companies(db)
    assert len(companies) >= 3
    assert any("TechNova" in c.name for c in companies)

    # 2. Filter by tech stack (e.g. Docker)
    docker_companies = get_companies(db, tech_filter="Docker")
    assert len(docker_companies) >= 1
    assert any("Docker" in c.tech_stack for c in docker_companies)

    # 3. Search by keyword
    search_results = get_companies(db, search="Analytics")
    assert len(search_results) >= 1
    assert any("Analytics" in c.name or "Analytics" in c.industry for c in search_results)

    db.close()


def test_ai_interview_gym_rubric_evaluation():
    db = SessionLocal()
    user = get_test_user(db)

    # 1. Question retrieval
    questions = get_interview_questions(role_title="Full Stack Developer", interview_type="technical")
    assert len(questions) >= 1
    sample_q = questions[0]
    assert len(sample_q.hints) >= 2

    # 2. Detailed Technical Answer Evaluation
    eval_req = InterviewEvaluationRequest(
        role_title="Full Stack Developer",
        interview_type="technical",
        question_text=sample_q.question_text,
        user_answer=(
            "In FastAPI, I manage asynchronous database sessions using SQLAlchemy AsyncSession with async/await. "
            "To prevent connection pool exhaustion under high concurrency, I explicitly configure pool_size=20 and "
            "max_overflow=10. Every route uses a dependency injection yield pattern so that sessions are safely closed "
            "in a finally block. To handle timeout failures, we configure pool_timeout=30s and implement circuit breakers."
        )
    )
    evaluation = evaluate_interview_answer(db, user.id, eval_req)
    assert evaluation.ai_score >= 8.0  # Detailed and technical keywords included
    assert len(evaluation.strengths) >= 2
    assert "Optimal Model Answer" in evaluation.suggested_answer

    # 3. Behavioral Answer Evaluation
    behav_req = InterviewEvaluationRequest(
        role_title="Full Stack Developer",
        interview_type="behavioral",
        question_text="Describe a difficult bug you resolved under a tight deadline.",
        user_answer=(
            "Situation: Right before our capstone demo, our database queries slowed to 8 seconds. "
            "Task: I was responsible for diagnosing the root cause. "
            "Action: I analyzed query logs, discovered missing indexes on foreign keys, and implemented B-Tree composite indexes. "
            "Result: Query response time dropped from 8,000ms to 42ms, reducing latency by 99% and enabling an on-time release."
        )
    )
    behav_eval = evaluate_interview_answer(db, user.id, behav_req)
    assert behav_eval.ai_score >= 8.5
    assert any("quantification" in s.lower() or "ownership" in s.lower() for s in behav_eval.strengths)

    db.close()


def test_tech_trends_market_intelligence():
    db = SessionLocal()
    # 1. Fetch all trends
    trends = get_tech_trends(db)
    assert len(trends) >= 4
    assert any(t.name in ["FastAPI", "React 19", "Docker & Containerization", "PyTorch"] for t in trends)

    # 2. Filter by category
    ai_trends = get_tech_trends(db, category="AI/ML")
    assert len(ai_trends) >= 1
    assert any("PyTorch" in t.name for t in ai_trends)
    assert ai_trends[0].avg_salary_inr != ""
    assert len(ai_trends[0].top_pairing_skills) >= 1

    db.close()
