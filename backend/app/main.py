"""
Vietnam Tourism AI Recommender - FastAPI Application

Entry point for the application.
Clean architecture following SOLID principles.

Structure:
- main.py          : Application entry point (this file)
- core/            : Configuration, dependencies
- models/          : Pydantic schemas
- services/        : Business logic (ML recommender)
- routers/         : API endpoints
"""

import sys

# =============================================================================
# CRITICAL: Pickle Deserialization Fix
# =============================================================================
# When the Jupyter notebook saved the model with joblib.dump(), it saved
# references to classes in __main__ (the notebook's namespace).
# When we load with joblib.load(), Python tries to find these classes
# in __main__ of THIS script - which doesn't have them.
#
# Solution: Import the classes and inject them into __main__'s namespace
# BEFORE any pickle loading happens.
# =============================================================================

from services.ml_components import ContentBasedFilter, LearningToRankDataset

# Inject classes into __main__ namespace so pickle can find them
sys.modules['__main__'].ContentBasedFilter = ContentBasedFilter
sys.modules['__main__'].LearningToRankDataset = LearningToRankDataset

# Now safe to import other modules that might trigger pickle loading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.dependencies import init_recommender, init_location_service
from routers import health, recommendations, utilities


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events (startup/shutdown).
    
    Startup:
    - Load ML models (CBF, XGBRanker)
    - Initialize location service (coordinates lookup)
    
    Shutdown:
    - Cleanup resources
    """
    # ==================== STARTUP ====================
    print("\n" + "=" * 60)
    print("🚀 Starting Vietnam Tourism AI Recommender")
    print("=" * 60)
    
    try:
        # Load ML models
        print("\n📦 Loading ML models...")
        init_recommender()
        print("✅ ML models loaded successfully!")
        
        # Load location service
        print("\n📍 Loading location service...")
        init_location_service()
        print("✅ Location service loaded successfully!")
        
        print("\n" + "=" * 60)
        print("🎉 Application ready to serve requests!")
        print(f"📖 API Docs: http://{settings.HOST}:{settings.PORT}/docs")
        print("=" * 60 + "\n")
        
    except FileNotFoundError as e:
        print(f"\n❌ Model files not found: {e}")
        print("💡 Hint: Make sure checkpoint files exist in 'backend/checkpoints/'")
        raise e
    except Exception as e:
        print(f"\n❌ Failed to start application: {e}")
        raise e
    
    yield
    
    # ==================== SHUTDOWN ====================
    print("\n" + "=" * 60)
    print("👋 Shutting down Vietnam Tourism AI Recommender...")
    print("=" * 60 + "\n")


def create_app() -> FastAPI:
    """
    Application factory - creates and configures FastAPI app.
    
    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title=settings.APP_NAME,
        description="""
## Vietnam Tourism AI Recommender API

Hệ thống tư vấn du lịch Việt Nam sử dụng AI.

### Tính năng chính:
- 🔍 **Smart Search**: Tìm kiếm địa điểm bằng ngôn ngữ tự nhiên
- 🏨 **Hotel Recommendations**: Gợi ý khách sạn phù hợp nhất
- 🍜 **Dining Suggestions**: Gợi ý quán ăn địa phương
- 🏛️ **Attractions**: Gợi ý điểm tham quan
- 🗺️ **Coordinates**: Tọa độ cho hiển thị bản đồ
- 🌤️ **Weather**: Thông tin thời tiết

### ML Pipeline:
1. **Stage 1 (Retrieval)**: TF-IDF Content-Based Filtering → Top 100 candidates
2. **Stage 2 (Ranking)**: XGBoost Ranker → Scored & sorted results
3. **Business Logic**: 1 Hotel + 2 Dining + 3 Attractions
        """,
        version=settings.APP_VERSION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_tags=[
            {"name": "Health", "description": "System health check"},
            {"name": "Recommendations", "description": "AI-powered travel recommendations"},
            {"name": "Utilities", "description": "Weather and other utilities"},
        ]
    )
    
    # ===========================================
    # CORS Middleware
    # ===========================================
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # ===========================================
    # Include Routers
    # ===========================================
    app.include_router(health.router)
    app.include_router(recommendations.router)
    app.include_router(utilities.router)
    
    return app


# ===========================================
# Create Application Instance
# ===========================================
app = create_app()


# ===========================================
# Development Server
# ===========================================
if __name__ == "__main__":
    import uvicorn
    
    print(f"\n🔧 Running in {'DEBUG' if settings.DEBUG else 'PRODUCTION'} mode")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
