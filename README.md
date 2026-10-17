# Roamwise AI — Bespoke Editorial Travel Itinerary Planner

**Roamwise AI** is a full-stack, AI-powered travel itinerary planner crafted with an **editorial travel-journal aesthetic** inspired by travel publications like *Condé Nast Traveler*, *Kinfolk*, and *National Geographic Traveler*.

It moves beyond generic AI chatbots and administrative dashboards, curating personalized, day-by-day journeys complete with morning-to-night schedules, authentic food trails, interactive maps, transit guidance, budget breakdowns, and server-generated PDF exports.

---

## 1. Product Features

- **Editorial Trip Planning Wizard**:
  - Interactive multi-step creation flow (Destination, Duration, Companions, Budget Tier, Travel Styles, Rhythm & Preferences).
  - Curated inspirations (Kyoto, Rome, Paris, Amalfi Coast, Oaxaca, Reykjavik) + instant global destination search.
  - Multi-companion modeling (Solo Explorer, Couple, Family with Kids, Friends Group).
  - 4 budget tiers: Backpacker (~$60/day), Moderate (~$160/day), Luxury (~$450/day), and Ultra-Luxe (~$980+/day).
- **Curated Daily Journal**:
  - Morning, Afternoon, Evening, and Night activity cards.
  - Estimated time duration, activity cost, and category badges.
  - Dedicated **"Insider Perspective"** tip boxes with local secrets.
  - **Transit Connectors** with estimated minutes and navigation directions between stops.
  - Day-by-day **Curated Culinary Stops** with signature dishes and neighborhood dining notes.
  - Inline **Activity Customizer** (edit title, description, time slot, notes, and costs) and **Add Stop** modal.
  - **Regenerate Day** capability to refresh any specific day while keeping the rest of the journey intact.
- **Interactive Leaflet Route Map**:
  - Bespoke minimalist map tiles with colored numbered pins (Morning: Amber, Afternoon: Terracotta, Evening: Forest).
  - Popups with activity title, time slot, category, and local tips.
- **Budget & Cost Allocation**:
  - Real-time expense calculator with dynamic split-by-traveler calculator.
  - Distribution breakdown across Lodging (40%), Dining (30%), Experiences (18%), Transit (7%), and Contingency Buffer (5%).
- **Curated Lodging & Stays**:
  - Boutique ryokans, heritage lofts, and design hotels with nightly rates and curator recommendations.
- **Field Notes & Packing Checklist**:
  - Climate profiles and optimal seasonal timing.
  - Cultural etiquette & local customs guide.
  - Interactive packing checklist where travelers can check off packed items.
- **Server-Side Editorial PDF Export**:
  - Generated on demand via Python `reportlab` with custom multi-pass headers, page numbers, tables, and typography.
- **Dual Persistence Architecture**:
  - Ready for **Supabase PostgreSQL** via environment variables with complete SQL migrations (`backend/migrations/001_initial_schema.sql`).
  - Automatic local **SQLite** storage (`roamwise_local.db`) so the application functions out of the box with zero external configuration required.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS + Custom Editorial Design System (Warm Linen `#FAF8F5`, Terracotta `#C85A32`, Deep Sage `#2D4A3E`, Warm Gold `#D4973B`)
- **Typography**: Google Fonts (*Cormorant Garamond* & *Plus Jakarta Sans*)
- **Mapping**: Leaflet with custom div markers & CartoDB tiles
- **Navigation**: React Router v7 / v6
- **Icons**: Lucide React
- **Celebration**: Canvas-Confetti

### Backend
- **Framework**: Python 3.11 + FastAPI
- **Validation**: Pydantic v2 schemas
- **PDF Generation**: ReportLab
- **AI Architecture**: Modular `AIService` supporting Google Gemini (`google-genai`), OpenAI, and a built-in Editorial Travel Intelligence engine
- **Database**: Supabase PostgreSQL client + Embedded SQLite fallback

---

## 3. Project Structure

```
Project Saransh/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuration & environment settings
│   │   ├── routers/        # API routes: /itinerary, /trips, /pdf
│   │   ├── schemas/        # Pydantic models (TripRequest, ItineraryResponse, etc.)
│   │   ├── services/       # AI service, PDF generator, Database service
│   │   └── main.py         # FastAPI application entrypoint
│   ├── migrations/         # Supabase PostgreSQL SQL setup (001_initial_schema.sql)
│   ├── tests/              # Pytest backend test suite
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/     # DayTimeline, TripMap, TripWizard, BudgetBreakdown, etc.
│   │   ├── pages/          # SavedTripsPage
│   │   ├── services/       # API client service
│   │   ├── types/          # TypeScript interface definitions
│   │   ├── App.tsx         # Routing & state controller
│   │   └── index.css       # Design tokens & typography
│   ├── package.json
│   └── vite.config.ts      # Proxy & Tailwind configuration
├── pytest.ini              # Pytest configuration
└── README.md
```

---

## 4. Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# In the project root, activate the virtual environment:
.\venv\Scripts\activate

# Install requirements (already installed):
pip install -r backend/requirements.txt

# Start the FastAPI server:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --app-dir backend
```
API Documentation will be live at: `http://127.0.0.1:8001/docs`

### 2. Frontend Setup
```bash
# Navigate to the frontend directory:
cd frontend

# Install dependencies:
npm install

# Start the development server:
npm run dev
```
Open your browser at `http://127.0.0.1:5173/`

---

## 5. Verification & Testing

### Backend Tests
Run the comprehensive Pytest suite:
```bash
.\venv\Scripts\pytest.exe -v
```
All 4 test suites pass:
- `test_health_endpoint`: Checks server health and configuration flags.
- `test_generate_itinerary`: Validates multi-day itinerary synthesis and database persistence.
- `test_activity_update_and_delete`: Verifies inline activity modifications and deletions.
- `test_pdf_export_and_download`: Tests server-side ReportLab PDF compilation and streaming.

### Frontend Build
Compile TypeScript and build the production bundle:
```bash
cd frontend
npm run build
```
Builds cleanly with 0 errors.
