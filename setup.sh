#!/usr/bin/env bash
set -e

echo "========================================================"
echo "        ROAMWISE AI - AUTOMATED PROJECT SETUP"
echo "========================================================"
echo ""

# Check python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 could not be found. Please install Python 3.10+."
    exit 1
fi

# Check node
if ! command -v node &> /dev/null; then
    echo "[ERROR] node could not be found. Please install Node.js 18+."
    exit 1
fi

echo "[1/4] Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

echo "[2/4] Installing backend dependencies..."
./venv/bin/python -m pip install --upgrade pip
./venv/bin/pip install -r backend/requirements.txt

echo "[3/4] Preparing environment configuration..."
if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
fi

echo "[4/4] Installing frontend npm packages..."
cd frontend
npm install
cd ..

echo "========================================================"
echo "  SETUP COMPLETED! Run ./start_app.sh to launch."
echo "========================================================"
