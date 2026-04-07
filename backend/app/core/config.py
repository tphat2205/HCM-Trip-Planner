"""
Configuration settings for Vietnam Tourism AI Recommender.

Uses Pydantic BaseSettings for environment variable management.
"""

from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # App info
    APP_NAME: str = "Vietnam Tourism AI Recommender"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://hcm-trip-planner.vercel.app/",
    ]
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    CHECKPOINT_DIR: Path = BASE_DIR / "artifacts"
    PUBLIC_DIR: Path = BASE_DIR / "public"
    MODEL_PREFIX: str = "vietnam_tourism"
    
    # Weather API (OpenWeatherMap)
    OPENWEATHERMAP_API_KEY: str = ""
    WEATHER_API_BASE_URL: str = "https://api.openweathermap.org/data/2.5/weather"
    
    # ML Settings
    TOP_K_CANDIDATES: int = 100
    FETCH_MULTIPLIER: int = 5  # Fetch 5x candidates for filtering buffer
    
    class Config:
        env_file = str(Path(__file__).resolve().parents[2] / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"


# Global settings instance
settings = Settings()
