@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo         ROAMWISE AI - AUTOMATED PROJECT SETUP
echo ========================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not added to your system PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Python detected.

:: 2. Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not added to your system PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detected.

echo.
echo [1/4] Setting up Python virtual environment...
if not exist "venv" (
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create Python virtual environment.
        pause
        exit /b 1
    )
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

echo.
echo [2/4] Installing backend Python dependencies...
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\pip.exe install -r backend\requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)
echo Backend dependencies installed.

echo.
echo [3/4] Preparing environment configuration...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo Created backend\.env from template.
    )
)

echo.
echo [4/4] Installing frontend npm packages...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend packages.
    cd ..
    pause
    exit /b 1
)
cd ..
echo Frontend packages installed.

echo.
echo ========================================================
echo   SETUP COMPLETED SUCCESSFULLY!
echo ========================================================
echo To start Roamwise AI, run: start_app.bat
echo Or start both servers manually:
echo   Backend:  .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --app-dir backend --reload
echo   Frontend: cd frontend && npm run dev
echo ========================================================
echo.
pause
