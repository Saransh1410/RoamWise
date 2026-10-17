# Roamwise AI — Setup & GitHub Upload Guide

Welcome! This package contains the full source code for **Roamwise AI**, an AI-powered personalized travel itinerary planner with an editorial travel-journal aesthetic.

---

## 🚀 Quick Start (Running on Your PC)

### Option A: 1-Click Setup (Windows)
1. **Double-click `setup.bat`**
   - It will automatically create the Python virtual environment (`venv`), install Python requirements, and install frontend npm packages.
2. **Double-click `start_app.bat`**
   - It launches both the FastAPI backend (`http://127.0.0.1:8001`) and the Vite frontend (`http://127.0.0.1:5173`).
3. Open your browser at **[http://127.0.0.1:5173](http://127.0.0.1:5173)**!

---

### Option B: Manual Setup (Windows, macOS, Linux)

#### 1. Requirements
- **Python 3.10+** (Ensure "Add Python to PATH" was checked during installation)
- **Node.js 18+** & `npm`

#### 2. Backend Setup
```bash
# 1. Create and activate a Python virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Start the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --app-dir backend --reload
```
API docs will be available at: **http://127.0.0.1:8001/docs**

#### 3. Frontend Setup (Open a second terminal)
```bash
cd frontend

# Install packages
npm install

# Start development server
npm run dev
```
Open **http://127.0.0.1:5173** in your browser.

---

## 🐙 How to Upload to Your GitHub

Follow these simple steps in your terminal to create and publish this repository to your personal GitHub account:

### Step 1: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Enter a repository name (e.g., `roamwise-ai` or `travel-itinerary-planner`).
3. Choose **Public** or **Private**.
4. **DO NOT** check "Add a README file", ".gitignore", or "license" (we already included them!).
5. Click **Create repository**.
6. Copy the repository URL (e.g., `https://github.com/your-username/roamwise-ai.git`).

### Step 2: Initialize Git and Push from Your PC
In the root of this project folder, open your terminal (PowerShell, Command Prompt, or Bash) and run:

```bash
# 1. Initialize git
git init

# 2. Add all files (the included .gitignore will safely exclude venv and node_modules)
git add .

# 3. Create your initial commit
git commit -m "Initial commit: Roamwise AI Travel Itinerary Planner"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub repository (replace with your actual GitHub URL)
git remote add origin https://github.com/your-username/roamwise-ai.git

# 6. Push to GitHub
git push -u origin main
```

---

## ⚙️ Optional Configuration (`backend/.env`)

Roamwise AI includes an intelligent built-in travel intelligence engine and SQLite persistence that works **completely offline without any external keys required**.

If you'd like to connect live cloud services:
1. Open `backend/.env` (created from `backend/.env.example`).
2. Add your keys:
   ```env
   # Google Gemini API key for live AI generation
   GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase credentials (optional - uses local SQLite if left blank)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   ```
3. If using Supabase, execute `backend/migrations/001_initial_schema.sql` in the Supabase SQL editor.

---

## 🧪 Running Automated Tests

To run the backend test suite:
```bash
# Activate virtual environment
.\venv\Scripts\activate   # or source venv/bin/activate on Mac/Linux

# Run tests
pytest -v
```

To run the frontend production build:
```bash
cd frontend
npm run build
```
