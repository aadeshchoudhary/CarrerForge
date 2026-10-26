@echo off
title CareerForge AI - AI Career Platform Launcher
echo ========================================================
echo   CareerForge AI - AI-Powered Career Platform Launcher
echo   Express.js + React 19 - Full Stack Operational
echo ========================================================
echo.

set "PATH=%PATH%;C:\Users\Aadesh Choudhary\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64"

echo [1/2] Starting Express.js Backend on port 8000...
start "CareerForge Backend (Express.js)" cmd /k "cd backend && npm start"

timeout /t 2 /nobreak >nul

echo [2/2] Starting React Vite Frontend on port 5173...
start "CareerForge Frontend (React+Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Both servers are launching!
echo Backend API:  http://127.0.0.1:8000/api/v1
echo Frontend App: http://127.0.0.1:5173
echo ========================================================
echo.
pause
