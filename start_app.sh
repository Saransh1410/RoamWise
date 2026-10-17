#!/usr/bin/env bash

if [ ! -d "venv" ]; then
    echo "Running setup first..."
    ./setup.sh
fi

echo "Starting FastAPI Backend on http://127.0.0.1:8001..."
./venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --app-dir backend --reload &
BACKEND_PID=$!

echo "Starting Vite Frontend on http://127.0.0.1:5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

echo ""
echo "Roamwise AI is running!"
echo "Frontend: http://127.0.0.1:5173"
echo "API Docs: http://127.0.0.1:8001/docs"
echo "Press Ctrl+C to terminate both servers."

wait
