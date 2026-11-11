import os
from typing import Dict, List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Public Speaking Coach"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-123456789")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./speech_coach.db")

    # LLM integration (optional)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Default Filler Words
    DEFAULT_FILLER_WORDS: List[str] = [
        "um", "uh", "like", "basically", "actually", 
        "you know", "so", "literally", "honestly", 
        "right", "i mean", "kind of", "sort of"
    ]

    # Speaking Pace Standard Ranges (WPM) per mode
    MODE_PACE_RANGES: Dict[str, Dict[str, int]] = {
        "presentation": {"min": 130, "target_min": 140, "target_max": 160, "max": 180},
        "interview": {"min": 110, "target_min": 120, "target_max": 150, "max": 170},
        "elevator_pitch": {"min": 140, "target_min": 150, "target_max": 175, "max": 195},
        "classroom": {"min": 100, "target_min": 110, "target_max": 140, "max": 160},
        "general": {"min": 120, "target_min": 130, "target_max": 160, "max": 180},
    }

    class Config:
        case_sensitive = True

settings = Settings()
