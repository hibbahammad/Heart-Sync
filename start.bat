@echo off
title Heart Sync Runner
echo ==============================================
echo        Starting Heart Sync Project
echo ==============================================
echo.
echo [1/2] Starting Backend Server on port 5000...
start "Heart Sync Backend" cmd /k "cd /d %~dp0backend && npm run start"

echo [2/2] Starting Frontend Dev Server on port 5173...
start "Heart Sync Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ----------------------------------------------
echo Project running successfully:
echo - Frontend: http://localhost:5173/
echo - Backend:  http://localhost:5000/
echo ----------------------------------------------
timeout /t 5
