"""
Weather service using OpenWeatherMap API.

Provides current weather data for travel planning.
"""

import httpx
from typing import Optional, Dict, Any
from core.config import settings


class WeatherService:
    """Service để lấy thông tin thời tiết từ OpenWeatherMap."""
    
    # Weather conditions không phù hợp cho outdoor activities
    BAD_WEATHER_CODES = {
        # Thunderstorm
        200, 201, 202, 210, 211, 212, 221, 230, 231, 232,
        # Heavy rain
        502, 503, 504, 511, 520, 521, 522, 531,
        # Snow
        600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622,
        # Extreme
        762, 771, 781,
    }
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Khởi tạo WeatherService.
        
        Args:
            api_key: OpenWeatherMap API key. Nếu None, lấy từ settings.
        """
        self.api_key = api_key or settings.OPENWEATHERMAP_API_KEY
        self.base_url = settings.WEATHER_API_BASE_URL
    
    async def get_weather(
        self, 
        city: str = "Ho Chi Minh City",
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Lấy thông tin thời tiết hiện tại.
        
        Args:
            city: Tên thành phố (mặc định HCM)
            lat: Latitude (ưu tiên nếu có)
            lon: Longitude (ưu tiên nếu có)
            
        Returns:
            Dict chứa thông tin thời tiết hoặc error message
        """
        if not self.api_key:
            return {
                "success": False,
                "error": "API key không được cấu hình. Vui lòng thêm OPENWEATHERMAP_API_KEY vào .env"
            }
        
        try:
            params = {
                "appid": self.api_key,
                "units": "metric",  # Celsius
                "lang": "vi"
            }
            
            # Ưu tiên coordinates nếu có
            if lat is not None and lon is not None:
                params["lat"] = lat
                params["lon"] = lon
            else:
                params["q"] = city
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.base_url, params=params)
                
                if response.status_code == 401:
                    return {
                        "success": False,
                        "error": "API key không hợp lệ"
                    }
                
                if response.status_code == 404:
                    return {
                        "success": False,
                        "error": f"Không tìm thấy thành phố: {city}"
                    }
                
                response.raise_for_status()
                data = response.json()
                
                # Parse weather data
                weather_id = data["weather"][0]["id"]
                is_outdoor_friendly = weather_id not in self.BAD_WEATHER_CODES
                
                return {
                    "success": True,
                    "data": {
                        "city": data.get("name", city),
                        "temperature": round(data["main"]["temp"], 1),
                        "feels_like": round(data["main"]["feels_like"], 1),
                        "humidity": data["main"]["humidity"],
                        "description": data["weather"][0]["description"],
                        "icon": data["weather"][0]["icon"],
                        "wind_speed": round(data["wind"]["speed"], 1),
                        "is_outdoor_friendly": is_outdoor_friendly,
                        "weather_id": weather_id
                    }
                }
                
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "Request timeout - vui lòng thử lại"
            }
        except httpx.HTTPStatusError as e:
            return {
                "success": False,
                "error": f"HTTP error: {e.response.status_code}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi không xác định: {str(e)}"
            }
    
    def get_weather_sync(
        self, 
        city: str = "Ho Chi Minh City",
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ) -> Dict[str, Any]:
        """Phiên bản sync của get_weather (dùng cho testing)."""
        import asyncio
        return asyncio.run(self.get_weather(city, lat, lon))


# Global instance
weather_service = WeatherService()
