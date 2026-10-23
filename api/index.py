"""
Vercel Serverless Function entrypoint for FastAPI backend.
"""
import sys
import os

# 1. Add repository backend directory to sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 2. Ensure VERCEL environment flag is set
os.environ["VERCEL"] = "1"

# 3. Import FastAPI ASGI application
from app.main import app
