@echo off
setlocal enabledelayedexpansion
REM ============================================================
REM  Help Culprit Recognition - one-time dependency installer
REM  Run this ONCE after copying the project to a new machine.
REM  Prerequisites (install these yourself first - see SETUP.md):
REM    .NET 8 SDK, Python 3.10+, Node.js 18+, MySQL 8.x
REM ============================================================

set ROOT=%~dp0
echo ============================================================
echo  Forensic project setup  (%ROOT%)
echo ============================================================
echo.

REM ---------- 1. Check prerequisites ----------
echo [1/5] Checking required tools...
set MISSING=0

where dotnet >nul 2>&1 || (echo   [X] .NET SDK not found  - see: https://dotnet.microsoft.com/download/dotnet/8.0 & set MISSING=1)
where python >nul 2>&1 || (echo   [X] Python not found     - see: https://www.python.org/downloads/ & set MISSING=1)
where node   >nul 2>&1 || (echo   [X] Node.js not found    - see: https://nodejs.org/ & set MISSING=1)
where mysql  >nul 2>&1 || (echo   [!] mysql CLI not on PATH ^(MySQL may still be installed^) - see: https://dev.mysql.com/downloads/installer/)

if "%MISSING%"=="1" (
    echo.
    echo Please install the missing tools above, then run setup.bat again.
    pause
    exit /b 1
)
echo   [OK] Core tools found.
echo.

REM ---------- 2. Python dependencies ----------
echo [2/5] Installing Python packages ^(this can take several minutes^)...
cd /d "%ROOT%implementation"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (echo   [X] Python install failed. & pause & exit /b 1)
echo   [OK] Python packages installed.
echo.

REM ---------- 3. Frontend dependencies ----------
echo [3/5] Installing React/Node packages...
cd /d "%ROOT%frontend\forensic-ui"
call npm install
if errorlevel 1 (echo   [X] npm install failed. & pause & exit /b 1)
echo   [OK] Frontend packages installed.
echo.

REM ---------- 4. Backend restore ----------
echo [4/5] Restoring .NET packages...
cd /d "%ROOT%backend\ForensicApi"
dotnet restore
if errorlevel 1 (echo   [X] dotnet restore failed. & pause & exit /b 1)
echo   [OK] Backend packages restored.
echo.

REM ---------- 5. MySQL connection ----------
echo [5/5] Database connection
echo The backend connects to MySQL as user 'root'.
set /p DBPW=Enter your MySQL root password (leave blank to keep current appsettings value):

if not "%DBPW%"=="" (
    echo Updating connection string in appsettings.json...
    powershell -NoProfile -Command "$f='%ROOT%backend\ForensicApi\appsettings.json'; $c=Get-Content $f -Raw; $c=$c -replace 'Pwd=[^;\"]*;','Pwd=%DBPW%;'; Set-Content $f $c -Encoding UTF8"
    echo Testing the connection...
    mysql -u root --password=%DBPW% -e "SELECT 1;" >nul 2>&1
    if errorlevel 1 (
        echo   [!] Could not connect with that password. Double-check it,
        echo       or edit backend\ForensicApi\appsettings.json manually.
    ) else (
        echo   [OK] MySQL connection works. The app auto-creates the 'ForensicDb' database on first run.
    )
) else (
    echo Skipped. Make sure the Pwd= value in
    echo   backend\ForensicApi\appsettings.json matches your MySQL root password.
)

echo.
echo ============================================================
echo  Setup complete!  Now double-click  start.bat  to run.
echo ============================================================
pause
