"""
Vercel Serverless Function entrypoint for FastAPI backend.
"""
import sys
import os

# 1. Ensure VERCEL environment flag is set first
os.environ["VERCEL"] = "1"

# 2. Add repository root and backend directory to sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# 3. Import FastAPI ASGI application with resilient fallback
try:
    from app.main import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(title="CareerForge API - Serverless Mode")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    @app.get("/api/v1/health")
    def serverless_health():
        return {
            "status": "serverless_active",
            "notice": "Backend operational; zero-login standalone fallback active.",
            "detail": str(e),
        }
