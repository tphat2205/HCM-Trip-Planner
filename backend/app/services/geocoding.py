"""
Location/Geocoding service.

Loads coordinates from map_locations.json and provides lookup functionality.
"""

import json
from pathlib import Path
from typing import Optional, Dict, Tuple
from difflib import SequenceMatcher


class LocationService:
    """Service để tra cứu tọa độ địa điểm từ file JSON."""
    
    def __init__(self, json_path: Path):
        """
        Khởi tạo LocationService.
        
        Args:
            json_path: Đường dẫn đến file map_locations.json
        """
        self.json_path = json_path
        self.locations: Dict[str, Dict[str, float]] = {}
        self._normalized_names: Dict[str, str] = {}  # normalized -> original
        self._load_locations()
    
    def _normalize_name(self, name: str) -> str:
        """Chuẩn hóa tên để so sánh."""
        return name.lower().strip()
    
    def _load_locations(self):
        """Load tọa độ từ file JSON."""
        try:
            if not self.json_path.exists():
                print(f"⚠️ File không tồn tại: {self.json_path}")
                return
                
            with open(self.json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            for item in data:
                name = item.get('name', '')
                lat = item.get('lat')
                lng = item.get('lng')
                
                if name and lat is not None and lng is not None:
                    self.locations[name] = {'lat': lat, 'lng': lng}
                    self._normalized_names[self._normalize_name(name)] = name
            
            print(f"✅ Đã load {len(self.locations)} địa điểm từ {self.json_path.name}")
            
        except Exception as e:
            print(f"❌ Lỗi khi load locations: {e}")
    
    def get_coordinates(self, place_name: str) -> Optional[Dict[str, float]]:
        """
        Tra cứu tọa độ của một địa điểm.
        
        Args:
            place_name: Tên địa điểm cần tra cứu
            
        Returns:
            Dict với 'lat' và 'lng' hoặc None nếu không tìm thấy
        """
        # Exact match
        if place_name in self.locations:
            return self.locations[place_name]
        
        # Normalized match
        normalized = self._normalize_name(place_name)
        if normalized in self._normalized_names:
            original = self._normalized_names[normalized]
            return self.locations[original]
        
        # Fuzzy match (similarity > 0.85)
        best_match = None
        best_score = 0.85
        
        for stored_name in self.locations.keys():
            score = SequenceMatcher(None, normalized, self._normalize_name(stored_name)).ratio()
            if score > best_score:
                best_score = score
                best_match = stored_name
        
        if best_match:
            return self.locations[best_match]
        
        return None
    
    def get_coordinates_batch(self, place_names: list) -> Dict[str, Optional[Dict[str, float]]]:
        """
        Tra cứu tọa độ cho nhiều địa điểm.
        
        Args:
            place_names: Danh sách tên địa điểm
            
        Returns:
            Dict mapping tên địa điểm -> tọa độ (hoặc None)
        """
        result = {}
        for name in place_names:
            result[name] = self.get_coordinates(name)
        return result
    
    @property
    def total_locations(self) -> int:
        """Tổng số địa điểm có tọa độ."""
        return len(self.locations)
