@echo off
title CareerForge Backend
cd /d "%~dp0"
echo Starting FastAPI Backend at http://127.0.0.1:8000 ...
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
