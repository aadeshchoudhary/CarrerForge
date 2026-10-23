"""
Main application factory for the AI-Powered Career Development Platform.
Initializes FastAPI, CORS, API routers, database tables, and default seed data.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database_if_empty
from app.services.resource_curator import seed_learning_resources_if_empty
from app.services.project_verifier import seed_project_catalog_if_empty
from app.services.badge_engine import seed_badges_catalog_if_empty
from app.services.community_service import seed_community_data_if_empty
from app.services.opportunity_service import seed_opportunity_data_if_empty
from app.api.v1 import (
    auth,
    profile,
    resume,
    skills,
    dashboard,
    resume_builder,
    career_finder,
    roadmap,
    resources,
    tracker,
    projects,
    passport,
    gamification,
    community,
    opportunities,
)

# 1. Create DB tables and seed benchmark data on startup
try:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database_if_empty(db)
        seed_learning_resources_if_empty(db)
        seed_project_catalog_if_empty(db)
        seed_badges_catalog_if_empty(db)
        seed_community_data_if_empty(db)
        seed_opportunity_data_if_empty(db)
except Exception as e:
    print(f"Database initialization notice: {e}")

# 2. Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API engine for the AI-Powered Career Development Platform (College Project)",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 3. Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Include API V1 Routers
# Phase 1
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication & Career ID"])
app.include_router(profile.router, prefix=f"{settings.API_V1_STR}/profile", tags=["Profile & Privacy"])
app.include_router(resume.router, prefix=f"{settings.API_V1_STR}/resume", tags=["Resume & Parsing"])
app.include_router(skills.router, prefix=f"{settings.API_V1_STR}/skills", tags=["Skill Gap Analysis"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard Widgets"])

# Phase 2
app.include_router(resume_builder.router, prefix=f"{settings.API_V1_STR}/resume-builder", tags=["Resume Builder & Quality Checker"])
app.include_router(career_finder.router, prefix=f"{settings.API_V1_STR}/career-finder", tags=["Career & Role Finder"])
app.include_router(roadmap.router, prefix=f"{settings.API_V1_STR}/roadmap", tags=["Career Roadmap Generator"])
app.include_router(resources.router, prefix=f"{settings.API_V1_STR}/resources", tags=["Training Resource Hub"])
app.include_router(tracker.router, prefix=f"{settings.API_V1_STR}/tracker", tags=["Preparation Tracker & Goals"])

# Phase 3
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["Project-to-Proof System"])
app.include_router(passport.router, prefix=f"{settings.API_V1_STR}/passport", tags=["Career Passport & Verification"])
app.include_router(gamification.router, prefix=f"{settings.API_V1_STR}/gamification", tags=["Badges, Quests & Leaderboard"])

# Phase 4
app.include_router(community.router, prefix=f"{settings.API_V1_STR}/community", tags=["Community Feed & Career Connect"])

# Phase 5
app.include_router(opportunities.router, prefix=f"{settings.API_V1_STR}/opportunities", tags=["Opportunity Center, Interview Gym & Trends"])


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
        "phase": "Phase 5 Complete — Platform Fully Operational"
    }


@app.get("/health", tags=["Health"])
def healthcheck():
    return {"status": "healthy", "version": "3.0.0"}
