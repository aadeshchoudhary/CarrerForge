"""
Database setup and connection management using SQLAlchemy.
Supports SQLite (local development) and PostgreSQL (production).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# If using SQLite, check_same_thread=False is required for FastAPI multithreaded requests
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False  # Set to True if you want to inspect raw SQL queries
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session per request
    and guarantees it closes after the response finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
