"""
Configuration settings for the AI-Powered Career Development Platform.
Supports environment variables with sensible defaults for local development and Vercel serverless deployment.
"""
import os
import tempfile
from typing import List
from pydantic_settings import BaseSettings


def get_default_database_url() -> str:
    env_db = os.environ.get("DATABASE_URL")
    if env_db:
        # Standardize postgres:// to postgresql:// for SQLAlchemy if provided by cloud providers
        if env_db.startswith("postgres://"):
            return env_db.replace("postgres://", "postgresql://", 1)
        return env_db
    # On Vercel, the root filesystem is read-only; use /tmp for SQLite
    if os.environ.get("VERCEL"):
        tmp_db = os.path.join(tempfile.gettempdir(), "career_platform.db").replace("\\", "/")
        return f"sqlite:///{tmp_db}"
    return "sqlite:///./career_platform.db"


def get_default_upload_dir() -> str:
    if os.environ.get("VERCEL"):
        tmp_up = os.path.join(tempfile.gettempdir(), "uploads")
        os.makedirs(tmp_up, exist_ok=True)
        return tmp_up
    return "./uploads"


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Career Development Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "college-project-super-secret-key-2026-development-use-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    DATABASE_URL: str = get_default_database_url()

    # CORS origins: allow local ports, vercel deployments, and wildcard for public API
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://carrer-forge.vercel.app",
        "https://career-forge.vercel.app",
        "*",
    ]

    UPLOAD_DIR: str = get_default_upload_dir()

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
