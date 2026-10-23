@echo off
title CareerForge AI - AI Career Platform Launcher
echo ========================================================
echo   CareerForge AI - AI-Powered Career Platform Launcher
echo   College Capstone Project - Full Stack Operational
echo ========================================================
echo.

set "PATH=%PATH%;C:\Users\Aadesh Choudhary\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64;C:\Users\Aadesh Choudhary\AppData\Local\Programs\Python\Python311"

echo [1/2] Starting Python FastAPI Backend on port 8000...
start "CareerForge Backend (FastAPI)" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Vite Frontend on port 5173...
start "CareerForge Frontend (React+Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Both servers are launching!
echo Backend Docs:  http://127.0.0.1:8000/docs
echo Frontend App:  http://127.0.0.1:5173
echo ========================================================
echo.
pause
