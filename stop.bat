@echo off
REM ============================================================
REM  Help Culprit Recognition - stop all app services
REM  Stops Python AI, .NET API, and React UI windows.
REM  (MySQL84 service is left running.)
REM ============================================================

echo Stopping Forensic application services...

REM Close the named service windows
taskkill /FI "WINDOWTITLE eq Forensic - Python AI (8000)*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Forensic - .NET API (5011)*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Forensic - React UI (5173)*" /T /F >nul 2>&1

REM Fallback: free the ports if anything is still bound
for %%P in (8000 5011 5173) do (
    for /f "tokens=5" %%I in ('netstat -ano ^| findstr ":%%P " ^| findstr LISTENING') do (
        taskkill /PID %%I /F >nul 2>&1
    )
)

echo Done. MySQL84 service was left running.
