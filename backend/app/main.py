from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import itinerary, trips, pdf
from app.services.db_service import db_service
from app.services.ai_service import ai_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Roamwise AI — High-Fidelity AI Travel Itinerary Planner Powered Exclusively by Groq",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup - Strict explicit origins + any preview/prod Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers (Standard routes + Vercel Serverless Function compatibility)
app.include_router(itinerary.router, prefix=settings.API_V1_STR)
app.include_router(trips.router, prefix=settings.API_V1_STR)
app.include_router(pdf.router, prefix=settings.API_V1_STR)

for v_prefix in ["/api/index.py", "/api/index"]:
    app.include_router(itinerary.router, prefix=f"{v_prefix}{settings.API_V1_STR}")
    app.include_router(trips.router, prefix=f"{v_prefix}{settings.API_V1_STR}")
    app.include_router(pdf.router, prefix=f"{v_prefix}{settings.API_V1_STR}")


@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
@app.get("/api/v1/health", tags=["System"])
@app.get("/api/index.py/health", tags=["System"])
@app.get("/api/index.py/api/health", tags=["System"])
@app.get("/api/index.py/api/v1/health", tags=["System"])
async def health_check():
    ai_status = ai_service.get_provider_status()
    db_status = db_service.get_status()
    
    security_mode = (
        "Supabase Authenticated Multi-User"
        if db_status["is_supabase_active"]
        else "Local / Demo Mode (Single-User Workspace)"
    )

    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": "1.1.0",
        "ai_provider": ai_status["sole_provider"],
        "groq_configured": ai_status["configured"],
        "groq_model": ai_status["model"],
        "active_database": db_status["active_database"],
        "supabase_configured": db_status["supabase_configured"],
        "security_mode": security_mode,
    }


@app.get("/", tags=["System"])
@app.get("/api/index.py", tags=["System"])
@app.get("/api/index.py/", tags=["System"])
async def root():
    return {
        "status": "online",
        "message": "API is Live",
        "health_check": "/api/health",
        "documentation": "/docs",
        "app": settings.PROJECT_NAME,
        "api_v1": settings.API_V1_STR,
    }


