"""
Opportunity Command Center, Company Explorer, AI Interview Gym, and Tech Trends Service (Phase 5).
"""
import json
import re
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.opportunity import (
    JobApplication,
    Company,
    InterviewSession,
    TechTrend,
)
from app.models.user import CareerID
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


BENCHMARK_COMPANIES = [
    {
        "name": "TechNova Solutions",
        "industry": "Enterprise SaaS & Cloud Infrastructure",
        "location": "Bengaluru / Remote",
        "website": "https://technova.example.com",
        "description": "Leading cloud workflow automation company modernizing enterprise supply chain logistics across APAC.",
        "tech_stack": "FastAPI, React, Python, PostgreSQL, Docker, Redis",
        "hiring_status": "Actively Hiring (Freshers & SDE-1)",
        "typical_interview_rounds": "Round 1: Online Assessment (DSA & SQL) -> Round 2: Technical Project Review -> Round 3: Low-Level System Design -> Round 4: Cultural Fit",
        "interview_tips": "Be prepared to explain database index strategies (B-Tree vs Hash) and asynchronous request handling in FastAPI."
    },
    {
        "name": "DeepVision AI Labs",
        "industry": "Applied Artificial Intelligence & Computer Vision",
        "location": "Pune / Hybrid",
        "website": "https://deepvision.example.com",
        "description": "Pioneering computer vision models for automated medical diagnostics and autonomous drone inspection.",
        "tech_stack": "Python, PyTorch, OpenCV, Docker, FastAPI, Scikit-Learn",
        "hiring_status": "Campus Drives Open (AI/ML Interns)",
        "typical_interview_rounds": "Round 1: Machine Learning Fundamentals & Linear Algebra -> Round 2: PyTorch Model Coding -> Round 3: Research Project Walkthrough",
        "interview_tips": "Showcase your GitHub project proofs! Interviewers verify if you wrote clean modular code and evaluated validation loss properly."
    },
    {
        "name": "Apex Analytics Corp",
        "industry": "Financial Technology & Big Data Analytics",
        "location": "Hyderabad / Hybrid",
        "website": "https://apexanalytics.example.com",
        "description": "Building next-generation fraud detection and algorithmic credit assessment for neo-banking institutions.",
        "tech_stack": "SQL, Python, Pandas, PostgreSQL, Tableau, Machine Learning",
        "hiring_status": "Actively Hiring (Data Analysts)",
        "typical_interview_rounds": "Round 1: Complex SQL Queries (Window functions, CTEs) -> Round 2: Pandas Data Cleaning Practical -> Round 3: Executive Dashboard Case Study",
        "interview_tips": "Practice window functions (`ROW_NUMBER()`, `RANK()`, `LEAD/LAG`) and explain data anomaly handling."
    },
    {
        "name": "CloudScale Systems",
        "industry": "Cloud Reliability & DevOps Engineering",
        "location": "Noida / Remote",
        "website": "https://cloudscale.example.com",
        "description": "Multi-cloud infrastructure management automating Kubernetes deployments for global e-commerce companies.",
        "tech_stack": "Docker, Kubernetes, Linux, Git, Python, AWS",
        "hiring_status": "Remote Friendly (DevOps Associates)",
        "typical_interview_rounds": "Round 1: Linux CLI & Shell Scripting -> Round 2: Docker Multi-Stage Builds & Networking -> Round 3: Incident Post-Mortem Scenario",
        "interview_tips": "Understand container layering, non-root user execution in Docker, and Kubernetes deployment strategies."
    }
]

BENCHMARK_TRENDS = [
    {
        "name": "FastAPI",
        "category": "Framework",
        "demand_growth": "+42% YoY",
        "market_adoption": "Explosive Growth",
        "avg_salary_inr": "₹8 - 18 LPA",
        "open_roles_count": 1850,
        "top_pairing_skills": "Python, Docker, PostgreSQL, React",
        "description": "Modern, high-performance web framework for building REST APIs with Python 3.8+ using standard type hints and async/await."
    },
    {
        "name": "React 19",
        "category": "Framework",
        "demand_growth": "+28% YoY",
        "market_adoption": "High",
        "avg_salary_inr": "₹7 - 16 LPA",
        "open_roles_count": 3400,
        "top_pairing_skills": "TypeScript, Tailwind CSS, Next.js, Redux",
        "description": "The dominant UI framework for building reactive single-page applications and component architectures globally."
    },
    {
        "name": "Docker & Containerization",
        "category": "Cloud/DevOps",
        "demand_growth": "+35% YoY",
        "market_adoption": "Universal Standard",
        "avg_salary_inr": "₹9 - 20 LPA",
        "open_roles_count": 2750,
        "top_pairing_skills": "Kubernetes, Linux, CI/CD, Python",
        "description": "Essential infrastructure prerequisite for modern microservices packaging, reproducible testing, and cloud deployments."
    },
    {
        "name": "PyTorch",
        "category": "AI/ML",
        "demand_growth": "+58% YoY",
        "market_adoption": "High (Academic & Industry Leader)",
        "avg_salary_inr": "₹10 - 24 LPA",
        "open_roles_count": 1620,
        "top_pairing_skills": "Python, Hugging Face, OpenCV, FastAPI",
        "description": "Leading deep learning framework for training large language models, vision transformers, and generative AI systems."
    },
    {
        "name": "PostgreSQL",
        "category": "Database",
        "demand_growth": "+31% YoY",
        "market_adoption": "Universal Standard",
        "avg_salary_inr": "₹8 - 18 LPA",
        "open_roles_count": 2900,
        "top_pairing_skills": "SQL, Python, SQLAlchemy, Redis",
        "description": "Powerful open-source object-relational database system with advanced JSON support, indexing, and transactional integrity."
    },
    {
        "name": "TypeScript",
        "category": "Language",
        "demand_growth": "+39% YoY",
        "market_adoption": "High",
        "avg_salary_inr": "₹8 - 17 LPA",
        "open_roles_count": 3100,
        "top_pairing_skills": "React, Node.js, Next.js, GraphQL",
        "description": "Typed superset of JavaScript that catches errors early in development and provides robust code refactoring for enterprise applications."
    }
]

BENCHMARK_INTERVIEW_QUESTIONS = {
    "Full Stack Developer": [
        {
            "role_title": "Full Stack Developer",
            "interview_type": "technical",
            "question_text": "Explain how you handle asynchronous database calls in a FastAPI backend connected to PostgreSQL, and what steps you take to prevent connection pool exhaustion under high traffic.",
            "hints": ["Mention async/await with AsyncSession", "Explain connection pool size and max overflow parameters", "Discuss database transaction commits/rollbacks and timeouts"]
        },
        {
            "role_title": "Full Stack Developer",
            "interview_type": "behavioral",
            "question_text": "Describe a difficult bug you encountered in a team project right before a deadline. How did you diagnose the root cause and ensure on-time delivery without introducing regressions?",
            "hints": ["Use the STAR method: Situation, Task, Action, Result", "Highlight systematic debugging tools (logs, git bisect, network inspector)", "Quantify the outcome"]
        },
        {
            "role_title": "Full Stack Developer",
            "interview_type": "system_design",
            "question_text": "How would you design a scalable notification service that sends email alerts and in-app updates to 50,000 active students without blocking web server requests?",
            "hints": ["Propose an asynchronous message queue (e.g. Redis + Celery/RabbitMQ)", "Separate worker processes from API servers", "Discuss idempotency and retry strategies for failed deliveries"]
        }
    ],
    "Data Analyst": [
        {
            "role_title": "Data Analyst",
            "interview_type": "technical",
            "question_text": "Walk me through how you would use SQL Window Functions to calculate a 7-day moving average of daily active users, and explain when you would choose CTEs over subqueries.",
            "hints": ["Use AVG(count) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)", "Explain CTE readability, maintainability, and recursive capabilities", "Discuss query execution plan caching"]
        },
        {
            "role_title": "Data Analyst",
            "interview_type": "behavioral",
            "question_text": "Tell me about a time when business stakeholders questioned the accuracy of your metrics or dashboard. How did you validate your numbers and communicate findings effectively?",
            "hints": ["Use STAR format", "Describe data reconciliation against source tables", "Highlight creating clear documentation and data lineage"]
        }
    ],
    "Machine Learning Engineer": [
        {
            "role_title": "Machine Learning Engineer",
            "interview_type": "technical",
            "question_text": "Your classification model achieves 98% accuracy on training data but only 64% on the validation set. Walk me through your step-by-step diagnostic process and concrete mitigation strategies.",
            "hints": ["Diagnose high variance / overfitting", "Propose data augmentation, regularization (L1/L2, Dropout), early stopping", "Analyze data leakage or train-test distribution skew"]
        },
        {
            "role_title": "Machine Learning Engineer",
            "interview_type": "system_design",
            "question_text": "How do you package and serve a PyTorch sentiment classification model in production to achieve sub-50ms inference latency under concurrent API queries?",
            "hints": ["Model quantization (INT8) or TorchScript compilation", "FastAPI async endpoints with GPU worker batching", "Containerization with lightweight slim base images"]
        }
    ],
    "Cloud & DevOps Associate": [
        {
            "role_title": "Cloud & DevOps Associate",
            "interview_type": "technical",
            "question_text": "Explain why multi-stage Docker builds are critical for production deployments, and outline 3 security best practices you enforce in Dockerfiles.",
            "hints": ["Separation of build environment from runtime container", "Running containers as non-root users", "Scanning images for CVE vulnerabilities and pinning base image digest tags"]
        }
    ]
}


def seed_opportunity_data_if_empty(db: Session):
    """
    Seed initial benchmark companies and technology trends if empty.
    """
    # 1. Seed companies
    if db.query(Company).count() == 0:
        for c_data in BENCHMARK_COMPANIES:
            comp = Company(
                name=c_data["name"],
                industry=c_data["industry"],
                location=c_data["location"],
                website=c_data["website"],
                description=c_data["description"],
                tech_stack=c_data["tech_stack"],
                hiring_status=c_data["hiring_status"],
                typical_interview_rounds=c_data["typical_interview_rounds"],
                interview_tips=c_data["interview_tips"]
            )
            db.add(comp)
        db.commit()

    # 2. Seed technology trends
    if db.query(TechTrend).count() == 0:
        for t_data in BENCHMARK_TRENDS:
            trend = TechTrend(
                name=t_data["name"],
                category=t_data["category"],
                demand_growth=t_data["demand_growth"],
                market_adoption=t_data["market_adoption"],
                avg_salary_inr=t_data["avg_salary_inr"],
                open_roles_count=t_data["open_roles_count"],
                top_pairing_skills=t_data["top_pairing_skills"],
                description=t_data["description"]
            )
            db.add(trend)
        db.commit()


# -------------------------------------------------------------
# Job Application Tracking Functions
# -------------------------------------------------------------
def get_user_applications(db: Session, user_id: str) -> List[JobApplicationOut]:
    """
    Retrieve all job applications tracked by the current user.
    """
    apps = db.query(JobApplication).filter(
        JobApplication.user_id == user_id
    ).order_by(desc(JobApplication.updated_at)).all()

    return [JobApplicationOut.model_validate(a) for a in apps]


def create_user_application(db: Session, user_id: str, data: JobApplicationCreate) -> JobApplicationOut:
    """
    Log a new application in the Opportunity Command Center. Awards +15 XP.
    """
    app = JobApplication(
        user_id=user_id,
        company_name=data.company_name,
        job_title=data.job_title,
        stage=data.stage,
        location=data.location,
        salary_range=data.salary_range,
        job_url=data.job_url,
        next_interview_date=data.next_interview_date,
        notes=data.notes,
        match_score=data.match_score or 80.0
    )
    db.add(app)

    # Award +15 XP
    cid = db.query(CareerID).filter(CareerID.user_id == user_id).first()
    if cid:
        cid.xp_points = (cid.xp_points or 0) + 15

    db.commit()
    db.refresh(app)
    return JobApplicationOut.model_validate(app)


def update_user_application(
    db: Session,
    user_id: str,
    application_id: str,
    data: JobApplicationUpdate
) -> JobApplicationOut:
    """
    Advance or update application stage. Awards milestone XP upon advancement.
    """
    app = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.user_id == user_id
    ).first()

    if not app:
        raise ValueError("Application record not found.")

    old_stage = app.stage

    if data.stage is not None:
        app.stage = data.stage
    if data.next_interview_date is not None:
        app.next_interview_date = data.next_interview_date
    if data.notes is not None:
        app.notes = data.notes
    if data.salary_range is not None:
        app.salary_range = data.salary_range
    if data.match_score is not None:
        app.match_score = data.match_score

    app.updated_at = datetime.now(timezone.utc)

    # Award milestone XP when advancing
    cid = db.query(CareerID).filter(CareerID.user_id == user_id).first()
    if cid and old_stage != app.stage:
        if app.stage == "interview":
            cid.xp_points = (cid.xp_points or 0) + 35  # +35 XP for securing interview
        elif app.stage == "offer":
            cid.xp_points = (cid.xp_points or 0) + 100  # +100 XP for converting offer!

    db.commit()
    db.refresh(app)
    return JobApplicationOut.model_validate(app)


def delete_user_application(db: Session, user_id: str, application_id: str) -> bool:
    """
    Remove an application from tracking.
    """
    app = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.user_id == user_id
    ).first()

    if not app:
        raise ValueError("Application record not found.")

    db.delete(app)
    db.commit()
    return True


def get_application_stats(db: Session, user_id: str) -> ApplicationStatsOut:
    """
    Compute application pipeline breakdown for Kanban summary cards.
    """
    apps = db.query(JobApplication).filter(JobApplication.user_id == user_id).all()

    counts = {
        "saved": 0,
        "applied": 0,
        "screening": 0,
        "interview": 0,
        "offer": 0,
        "rejected": 0
    }
    active_interviews = 0

    for a in apps:
        stage = (a.stage or "applied").lower()
        if stage in counts:
            counts[stage] += 1
        if stage in ["screening", "interview"] or a.next_interview_date is not None:
            active_interviews += 1

    return ApplicationStatsOut(
        total_applications=len(apps),
        saved_count=counts["saved"],
        applied_count=counts["applied"],
        screening_count=counts["screening"],
        interview_count=counts["interview"],
        offer_count=counts["offer"],
        rejected_count=counts["rejected"],
        active_interviews_count=active_interviews
    )


# -------------------------------------------------------------
# Company Explorer Functions
# -------------------------------------------------------------
def get_companies(
    db: Session,
    search: Optional[str] = None,
    tech_filter: Optional[str] = None
) -> List[CompanyOut]:
    """
    Get company catalog with search and tech stack matching.
    """
    query = db.query(Company)
    if search:
        s_pat = f"%{search.lower()}%"
        query = query.filter(Company.name.ilike(s_pat) | Company.industry.ilike(s_pat))

    companies = query.all()
    results = []

    for c in companies:
        stack_list = [s.strip() for s in (c.tech_stack or "").split(",") if s.strip()]

        if tech_filter and tech_filter.lower() != "all":
            if not any(tech_filter.lower() in s.lower() for s in stack_list):
                continue

        results.append(CompanyOut(
            id=c.id,
            name=c.name,
            industry=c.industry,
            location=c.location,
            website=c.website,
            description=c.description,
            tech_stack=stack_list,
            hiring_status=c.hiring_status,
            typical_interview_rounds=c.typical_interview_rounds,
            interview_tips=c.interview_tips
        ))

    return results


# -------------------------------------------------------------
# AI Interview Gym Functions
# -------------------------------------------------------------
def get_interview_questions(
    role_title: str = "Full Stack Developer",
    interview_type: str = "technical"
) -> List[InterviewQuestionOut]:
    """
    Fetch curated benchmark questions tailored to candidate target role and mode.
    """
    role_key = "Full Stack Developer"
    for k in BENCHMARK_INTERVIEW_QUESTIONS.keys():
        if k.lower() in role_title.lower() or role_title.lower() in k.lower():
            role_key = k
            break

    role_questions = BENCHMARK_INTERVIEW_QUESTIONS.get(role_key, BENCHMARK_INTERVIEW_QUESTIONS["Full Stack Developer"])
    
    # Filter by interview_type if specified
    filtered = [
        q for q in role_questions
        if interview_type.lower() == "all" or q["interview_type"] == interview_type.lower()
    ]
    if not filtered:
        filtered = role_questions

    return [
        InterviewQuestionOut(
            role_title=q["role_title"],
            interview_type=q["interview_type"],
            question_text=q["question_text"],
            hints=q["hints"]
        )
        for q in filtered
    ]


def evaluate_interview_answer(
    db: Session,
    user_id: str,
    req: InterviewEvaluationRequest
) -> InterviewEvaluationOut:
    """
    Explainable AI rubric scoring for interview answers.
    Evaluates:
    - Technical Depth & Conceptual Accuracy (Keyword presence: async, concurrency, pool, index, complexity)
    - Structural Clarity (STAR method for behavioral; step-by-step problem framing for technical)
    - Corner Cases & Production Realism (timeouts, failover, edge cases, error handling)
    """
    text = req.user_answer.strip()
    words = len(text.split())

    score = 6.0
    strengths = []
    improvements = []

    # 1. Depth & Length Check
    if words >= 80:
        score += 1.2
        strengths.append(f"Comprehensive elaboration ({words} words) demonstrating deep domain familiarity.")
    elif words >= 40:
        score += 0.6
        strengths.append("Clear foundational points stated.")
    else:
        improvements.append("Response is brief. In technical interviews, articulate your thought process and architecture decisions in greater detail.")

    # 2. Domain & Technical Keyword Detection
    tech_keywords = [
        "async", "await", "connection", "pool", "index", "query", "timeout", "cache",
        "redis", "docker", "variance", "overfitting", "validation", "regularization",
        "star", "situation", "task", "action", "result", "metric", "scalability", "complexity"
    ]
    matched_tech = [w for w in tech_keywords if w in text.lower()]

    if len(matched_tech) >= 3:
        score += 1.3
        strengths.append(f"Accurate terminology and architectural constructs referenced: {', '.join(matched_tech[:4])}.")
    else:
        improvements.append("Incorporate specific technical terms (e.g., connection limits, time/space trade-offs, retry policies) to sound authoritative.")

    # 3. Behavioral STAR or Technical Edge Cases
    if req.interview_type == "behavioral":
        has_star_action = any(k in text.lower() for k in ["i decided", "action", "resolved", "implemented", "communicated"])
        has_star_metric = any(char.isdigit() for char in text) or any(k in text.lower() for k in ["percent", "improved", "delivered", "outcome"])
        if has_star_action:
            score += 0.5
            strengths.append("Clearly highlighted personal ownership and direct problem-solving actions taken.")
        else:
            improvements.append("Highlight the specific 'Action' YOU took rather than generic team efforts.")
        if has_star_metric:
            score += 0.5
            strengths.append("Effective quantification of final results and business impact.")
        else:
            improvements.append("Add quantifiable metrics to close your story (e.g., 'reduced latency by 30%', 'shipped 2 days ahead of schedule').")
    else:
        # Technical
        has_edge_cases = any(k in text.lower() for k in ["timeout", "overflow", "fail", "rollback", "edge case", "exception", "latency"])
        if has_edge_cases:
            score += 0.8
            strengths.append("Thoughtfully addressed failure modes and edge case resilience.")
        else:
            improvements.append("Discuss failure handling and corner cases (e.g., what happens when connections max out or a network timeout occurs?).")

    # Clamp score to realistic range (5.5 - 9.8)
    final_score = round(min(9.8, max(5.5, score)), 1)

    # Model Answer formulation
    if "fastapi" in req.question_text.lower() or "connection pool" in req.question_text.lower():
        suggested = (
            "Optimal Model Answer: 'In FastAPI, asynchronous database sessions are managed using SQLAlchemy AsyncSession "
            "with an async driver like asyncpg. To prevent connection pool exhaustion under high concurrency, I configure pool_size (e.g. 20) "
            "and max_overflow (e.g. 10) in create_async_engine. Every endpoint uses dependency injection with yield to guarantee that the session "
            "is closed in a finally block even if exceptions occur. Additionally, setting a pool_timeout (e.g. 30s) prevents thread starvation.'"
        )
    elif "accuracy" in req.question_text.lower() or "overfitting" in req.question_text.lower():
        suggested = (
            "Optimal Model Answer: 'A 98% train accuracy paired with 64% validation accuracy indicates significant overfitting (high variance). "
            "My diagnostic checklist: 1. Verify train/validation split data leakage; 2. Introduce L2 weight decay and Dropout layers; "
            "3. Apply data augmentation to expand sample diversity; 4. Use EarlyStopping callbacks tracking validation loss rather than train accuracy; "
            "5. If still persisting, reduce model capacity or collect additional edge-case examples.'"
        )
    else:
        suggested = (
            "Optimal Model Answer: Structure your answer by first stating your primary architectural approach, "
            "justifying the trade-offs (e.g. latency vs consistency), walking through edge cases, and concluding with "
            "how you verify and monitor the solution in production using logs and health metrics."
        )

    # Save interview session to database
    session_obj = InterviewSession(
        user_id=user_id,
        role_title=req.role_title,
        interview_type=req.interview_type,
        question_text=req.question_text,
        user_answer=req.user_answer,
        ai_score=final_score,
        strengths=json.dumps(strengths),
        areas_for_improvement=json.dumps(improvements),
        suggested_answer=suggested
    )
    db.add(session_obj)

    # Award +20 XP for interview practice
    cid = db.query(CareerID).filter(CareerID.user_id == user_id).first()
    if cid:
        cid.xp_points = (cid.xp_points or 0) + 20

    db.commit()
    db.refresh(session_obj)

    return InterviewEvaluationOut(
        id=session_obj.id,
        role_title=session_obj.role_title,
        interview_type=session_obj.interview_type,
        question_text=session_obj.question_text,
        user_answer=session_obj.user_answer,
        ai_score=session_obj.ai_score,
        strengths=strengths,
        areas_for_improvement=improvements,
        suggested_answer=session_obj.suggested_answer,
        created_at=session_obj.created_at
    )


# -------------------------------------------------------------
# Technology Trends Functions
# -------------------------------------------------------------
def get_tech_trends(
    db: Session,
    category: Optional[str] = None
) -> List[TechTrendOut]:
    """
    Get technology trends filtered by category.
    """
    query = db.query(TechTrend)
    if category and category.lower() != "all":
        query = query.filter(TechTrend.category.ilike(f"%{category}%"))

    trends = query.order_by(desc(TechTrend.open_roles_count)).all()
    results = []
    for t in trends:
        pairings = [p.strip() for p in (t.top_pairing_skills or "").split(",") if p.strip()]
        results.append(TechTrendOut(
            id=t.id,
            name=t.name,
            category=t.category,
            demand_growth=t.demand_growth,
            market_adoption=t.market_adoption,
            avg_salary_inr=t.avg_salary_inr,
            open_roles_count=t.open_roles_count,
            top_pairing_skills=pairings,
            description=t.description
        ))
    return results
