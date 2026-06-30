@echo off
REM ============================================================
REM  Help Culprit Recognition - launch all services
REM  Opens 3 windows: Python AI, .NET API, React UI.
REM  MySQL (service MySQL84) must already be running.
REM ============================================================

set ROOT=%~dp0

echo Starting Forensic application from %ROOT%
echo.

REM --- 0. Make sure MySQL service is up ---
sc query MySQL84 | find "RUNNING" >nul
if errorlevel 1 (
    echo [!] MySQL84 service is not running. Trying to start it...
    net start MySQL84
)

REM --- 1. Python AI service (FastAPI on :8000) ---
echo Launching Python AI service...
start "Forensic - Python AI (8000)" cmd /k "cd /d %ROOT%implementation && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

REM --- 2. .NET backend API (:5011) ---
echo Launching .NET backend API...
start "Forensic - .NET API (5011)" cmd /k "cd /d %ROOT%backend\ForensicApi && dotnet run"

REM --- 3. React frontend (Vite on :5173) ---
echo Launching React frontend...
start "Forensic - React UI (5173)" cmd /k "cd /d %ROOT%frontend\forensic-ui && npm run dev"

echo.
echo ------------------------------------------------------------
echo  All services launching in separate windows.
echo  Wait ~30-60s for the Python models to finish loading.
echo.
echo    UI:      http://localhost:5173
echo    API:     http://localhost:5011
echo    Python:  http://127.0.0.1:8000/docs
echo ------------------------------------------------------------
echo.
echo Opening the UI in your browser in 15 seconds...
timeout /t 15 /nobreak >nul
start "" http://localhost:5173
