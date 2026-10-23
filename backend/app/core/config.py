"""
Configuration settings for the AI-Powered Career Development Platform.
Supports environment variables with sensible defaults for local development.
"""
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Career Development Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "college-project-super-secret-key-2026-development-use-only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SQLite by default for effortless zero-config local run;
    # Can be swapped to PostgreSQL: "postgresql://user:pass@localhost:5432/career_db"
    DATABASE_URL: str = "sqlite:///./career_platform.db"

    # Allow local frontend to communicate with backend
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # File uploads directory
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
