@echo off
echo ========================================================
echo         STARTING ROAMWISE AI APPLICATION
echo ========================================================
echo.

if not exist "venv" (
    echo Virtual environment not found! Running setup first...
    call setup.bat
)

echo Starting FastAPI Backend on http://127.0.0.1:8001 ...
start "Roamwise Backend (FastAPI)" cmd /k ".\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --app-dir backend --reload"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo Starting Vite Frontend on http://127.0.0.1:5173 ...
start "Roamwise Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   ROAMWISE AI IS RUNNING!
echo   Frontend Application: http://127.0.0.1:5173
echo   Interactive API Docs: http://127.0.0.1:8001/docs
echo ========================================================
echo Keep this window open or minimize it. Press any key to close this launcher.
pause >nul
