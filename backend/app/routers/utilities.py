"""
Utility API endpoints.

Provides additional services like weather.
"""

from fastapi import APIRouter, Query
from typing import Optional

from app.models.schemas import WeatherRequest, WeatherResponse, WeatherInfo
from app.services.weather import weather_service

router = APIRouter(prefix="/api", tags=["Utilities"])


@router.get("/weather", response_model=WeatherResponse)
async def get_weather(
    city: str = Query(default="Ho Chi Minh City", description="Tên thành phố"),
    lat: Optional[float] = Query(default=None, description="Latitude"),
    lon: Optional[float] = Query(default=None, description="Longitude")
):
    """
    Lấy thông tin thời tiết hiện tại.
    
    Có thể truy vấn theo:
    - Tên thành phố (mặc định: Ho Chi Minh City)
    - Tọa độ (lat, lon) - ưu tiên nếu có
    
    Returns:
        WeatherResponse với thông tin nhiệt độ, độ ẩm, mô tả thời tiết
    """
    result = await weather_service.get_weather(city=city, lat=lat, lon=lon)
    
    if result.get("success"):
        data = result["data"]
        return WeatherResponse(
            success=True,
            data=WeatherInfo(
                city=data["city"],
                temperature=data["temperature"],
                feels_like=data["feels_like"],
                humidity=data["humidity"],
                description=data["description"],
                icon=data["icon"],
                wind_speed=data["wind_speed"],
                is_outdoor_friendly=data["is_outdoor_friendly"]
            ),
            error=None
        )
    else:
        return WeatherResponse(
            success=False,
            data=None,
            error=result.get("error", "Unknown error")
        )


@router.post("/weather", response_model=WeatherResponse)
async def get_weather_post(request: WeatherRequest):
    """POST version của weather endpoint."""
    return await get_weather(
        city=request.city,
        lat=request.lat,
        lon=request.lon
    )
