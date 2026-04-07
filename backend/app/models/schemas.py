"""
Pydantic schemas for request/response models.

Defines the API contract between frontend and backend.
"""

from pydantic import BaseModel, Field, field_serializer
from typing import Optional, List, Dict, Any
from enum import Enum
import uuid


# ============== Request Models ==============

class RecommendationRequest(BaseModel):
    """Request model for recommendation endpoint."""
    query: str = Field(..., min_length=1, max_length=500, description="Câu truy vấn của người dùng")
    districts: Optional[List[str]] = Field(None, description="Danh sách quận/huyện để lọc")
    max_price: Optional[float] = Field(None, ge=0, description="Ngân sách tối đa (VNĐ)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "Tìm khách sạn view đẹp ở Quận 1",
                "districts": ["Quận 1", "Quận 3"],
                "max_price": 2000000
            }
        }


class WeatherRequest(BaseModel):
    """Request model for weather endpoint."""
    city: str = Field(default="Ho Chi Minh City", description="Tên thành phố")
    lat: Optional[float] = Field(None, description="Latitude")
    lon: Optional[float] = Field(None, description="Longitude")


# ============== Response Models ==============

class LocationCoordinates(BaseModel):
    """Coordinates for a location."""
    lat: Optional[float] = Field(None, description="Latitude")
    lng: Optional[float] = Field(None, description="Longitude")


class PlaceItem(BaseModel):
    """Model for a single place (hotel, dining, attraction)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique ID")
    name: str = Field(..., description="Tên địa điểm")
    category: Optional[str] = Field(None, description="Loại địa điểm")
    address: Optional[str] = Field(None, description="Địa chỉ")
    district: Optional[str] = Field(None, description="Quận/Huyện")
    price_min: Optional[float] = Field(None, description="Giá thấp nhất")
    price_max: Optional[float] = Field(None, description="Giá cao nhất")
    score: Optional[float] = Field(None, description="Điểm đánh giá")
    start_time: Optional[str] = Field(None, description="Giờ mở cửa")
    end_time: Optional[str] = Field(None, description="Giờ đóng cửa")
    url: Optional[str] = Field(None, description="Link chi tiết")
    relevance_score: Optional[float] = Field(None, description="Điểm phù hợp")
    reason: Optional[str] = Field(None, description="Lý do gợi ý")
    lat: Optional[float] = Field(None, description="Latitude")
    lng: Optional[float] = Field(None, description="Longitude")
    
    class Config:
        extra = "ignore"


class RecommendationResponse(BaseModel):
    """Response model for recommendation endpoint."""
    hotels: List[PlaceItem] = Field(default_factory=list, description="Danh sách khách sạn (tối đa 1)")
    restaurants: List[PlaceItem] = Field(default_factory=list, description="Danh sách quán ăn (tối đa 2)")
    attractions: List[PlaceItem] = Field(default_factory=list, description="Danh sách điểm tham quan (tối đa 3)")
    warning: Optional[str] = Field(None, description="Thông báo từ hệ thống")
    total_places: int = Field(0, description="Tổng số địa điểm gợi ý")
    estimated_budget: Optional[float] = Field(None, description="Ước tính ngân sách")
    
    class Config:
        json_schema_extra = {
            "example": {
                "hotels": [{"id": "1", "name": "Khách sạn ABC", "price_min": 500000}],
                "restaurants": [{"id": "2", "name": "Quán A"}, {"id": "3", "name": "Quán B"}],
                "attractions": [{"id": "4", "name": "Điểm X"}, {"id": "5", "name": "Điểm Y"}, {"id": "6", "name": "Điểm Z"}],
                "warning": "Thỏa mãn toàn bộ tiêu chí tìm kiếm.",
                "total_places": 6,
                "estimated_budget": 1500000
            }
        }


class WeatherInfo(BaseModel):
    """Weather information model."""
    city: str = Field(..., description="Tên thành phố")
    temperature: float = Field(..., description="Nhiệt độ (°C)")
    feels_like: float = Field(..., description="Cảm giác như (°C)")
    humidity: int = Field(..., description="Độ ẩm (%)")
    description: str = Field(..., description="Mô tả thời tiết")
    icon: str = Field(..., description="Icon code")
    wind_speed: float = Field(..., description="Tốc độ gió (m/s)")
    is_outdoor_friendly: bool = Field(..., description="Có phù hợp hoạt động ngoài trời không")
    
    class Config:
        json_schema_extra = {
            "example": {
                "city": "Ho Chi Minh City",
                "temperature": 32.5,
                "feels_like": 38.0,
                "humidity": 70,
                "description": "Partly cloudy",
                "icon": "03d",
                "wind_speed": 3.5,
                "is_outdoor_friendly": True
            }
        }


class WeatherResponse(BaseModel):
    """Response model for weather endpoint."""
    success: bool = Field(..., description="Trạng thái request")
    data: Optional[WeatherInfo] = Field(None, description="Thông tin thời tiết")
    error: Optional[str] = Field(None, description="Thông báo lỗi")


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str = Field(..., description="Trạng thái hệ thống")
    version: str = Field(..., description="Phiên bản API")
    model_loaded: bool = Field(..., description="Model đã được load chưa")
    total_items: int = Field(0, description="Số lượng địa điểm trong database")

