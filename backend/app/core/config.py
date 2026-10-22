import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Roamwise AI"
    API_V1_STR: str = "/api/v1"
    
    # Groq LLM Configuration (Sole Provider)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    
    # Supabase / DB Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    DATABASE_PATH: str = "/tmp/roamwise_local.db" if os.environ.get("VERCEL") else "roamwise_local.db"
    
    # Security: Explicit CORS Origins (No wildcard '*' allowed)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000"
    ]
    
    # Demo / Environment mode
    APP_ENV: str = "development"
    
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
