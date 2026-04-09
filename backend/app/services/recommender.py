"""
Vietnam Tourism Recommender - Main service class.

This is the core recommendation engine that combines:
- Stage 1: Content-Based Filtering (TF-IDF)
- Stage 2: XGBoost Ranker
- Business Logic: 1 Hotel, 2 Dining, 3 Attractions
"""

import joblib
from pathlib import Path
from typing import Optional, List, Dict, Any
import pandas as pd

from app.services.ml_components import ContentBasedFilter, LearningToRankDataset


class VietnamTourismRecommender:
    """
    Hệ thống Tư vấn Du lịch Việt Nam.
    
    Tích hợp:
    - Bộ lọc cứng (districts, max_price)
    - Cơ chế nới lỏng (fallback) thông minh
    - Tối ưu khoảng cách hành chính
    """
    
    def __init__(self, checkpoint_dir: str = 'checkpoints', prefix: str = 'vietnam_tourism'):
        """
        Khởi tạo hệ thống và nạp các thành phần từ checkpoint.
        
        Args:
            checkpoint_dir: Thư mục chứa file .pkl
            prefix: Tiền tố tên file checkpoint
        """
        self.checkpoint_dir = Path(checkpoint_dir)
        self.prefix = prefix
        self.cbf: Optional[ContentBasedFilter] = None
        self.dataset_builder: Optional[LearningToRankDataset] = None
        self.xgb_model = None
        self.metadata: Dict[str, Any] = {}
        self._load_components()

    def _load_components(self):
        """Nạp các file .pkl vào bộ nhớ."""
        print("\nĐang nạp mô hình từ checkpoint...")
        try:
            cbf_path = self.checkpoint_dir / f'{self.prefix}_cbf.pkl'
            self.cbf = joblib.load(cbf_path)
            print(f"  Loaded: {cbf_path.name}")

            encoder_path = self.checkpoint_dir / f'{self.prefix}_encoder.pkl'
            self.dataset_builder = joblib.load(encoder_path)
            self.dataset_builder.cbf = self.cbf  # Khôi phục liên kết
            print(f"  Loaded: {encoder_path.name}")

            model_path = self.checkpoint_dir / f'{self.prefix}_xgbranker.pkl'
            self.xgb_model = joblib.load(model_path)
            print(f"  Loaded: {model_path.name}")

            metadata_path = self.checkpoint_dir / f'{self.prefix}_metadata.pkl'
            self.metadata = joblib.load(metadata_path)
            print(f"  Loaded: {metadata_path.name}")
            
            print(f"\nTải hệ thống thành công! (Sẵn sàng phục vụ {self.metadata.get('n_items', 0):,} địa điểm)")
            
        except FileNotFoundError as e:
            print(f"File không tìm thấy: {e}")
            raise
        except Exception as e:
            print(f"Lỗi khi nạp mô hình: {str(e)}")
            raise

    def _extract_district(self, address: str) -> str:
        """Trích xuất tên Quận/Huyện từ địa chỉ."""
        if not isinstance(address, str):
            return "Unknown"
        
        parts = address.split(',')
        for part in parts:
            part = part.strip()
            if any(keyword in part for keyword in ["Quận", "Huyện", "Thị xã", "Thành phố"]):
                return part.strip()
        return "Unknown"

    def _has_hotel(self, df: pd.DataFrame) -> bool:
        """Kiểm tra xem danh sách có khách sạn không."""
        if df.empty: 
            return False
        return df['Category'].str.contains('hotel', case=False, na=False).any()

    def _apply_hard_filter(
        self, 
        df: pd.DataFrame, 
        districts: Optional[List[str]], 
        max_price: Optional[float]
    ) -> pd.DataFrame:
        """
        Lọc cứng theo Quận và Ngân sách.
        
        Sử dụng Negative Lookahead để tránh Quận 1 khớp với Quận 10, 11.
        """
        temp_df = df.copy()
        
        if districts:
            pattern = '|'.join([rf"{d}(?![0-9])" for d in districts])
            temp_df = temp_df[temp_df['Address'].str.contains(pattern, case=False, na=False)]
        
        if max_price is not None:
            prices = pd.to_numeric(temp_df['Price_min'], errors='coerce').fillna(0)
            temp_df = temp_df[prices <= max_price]
            
        return temp_df

    def recommend(
        self, 
        user_query: str, 
        districts: Optional[List[str]] = None, 
        max_price: Optional[float] = None,
        verbose: bool = True
    ) -> Dict[str, Any]:
        """
        Tiếp nhận truy vấn và đưa ra danh sách gợi ý.
        
        Args:
            user_query: Câu truy vấn của người dùng
            districts: Danh sách quận/huyện để lọc
            max_price: Ngân sách tối đa (VNĐ)
            verbose: In log chi tiết
            
        Returns:
            Dict chứa hotels, dining, attractions, warning
        """
        if verbose:
            print("\n" + "=" * 70)
            print("VIETNAM TOURISM RECOMMENDER - QUÁ TRÌNH SUY LUẬN")
            print("=" * 70)
            display_query = user_query[:100] + "..." if len(user_query) > 100 else user_query
            print(f"Truy vấn: {display_query}")
            print(f"Khu vực: {districts if districts else 'Toàn quốc'}")
            print(f"Ngân sách: {max_price:,.0f} VNĐ" if max_price else "Ngân sách: Không giới hạn")

        # Stage 1: Trích xuất ứng viên (Lấy 5x để có buffer cho filtering)
        base_top_k = self.metadata.get('top_k', 100)
        fetch_k = base_top_k * 5
        candidates = self.cbf.get_candidates(user_query, top_k=fetch_k)
        
        if candidates.empty:
            return self._empty_response()

        # Stage 2: Lọc cứng + Fallback thông minh
        warning_msg = "Thỏa mãn toàn bộ tiêu chí tìm kiếm."
        
        filtered_df = self._apply_hard_filter(candidates, districts, max_price)
        
        # Fallback 1: Tăng ngân sách 20%
        if (filtered_df.empty or not self._has_hotel(filtered_df)) and max_price is not None:
            warning_msg = "Không tìm thấy kết quả phù hợp. Đã nới lỏng ngân sách thêm 20%."
            filtered_df = self._apply_hard_filter(candidates, districts, max_price * 1.2)
            
            # Fallback 2: Bỏ giới hạn ngân sách
            if filtered_df.empty or not self._has_hotel(filtered_df):
                warning_msg = "Ngân sách quá thấp. Đã bỏ tiêu chí ngân sách."
                filtered_df = self._apply_hard_filter(candidates, districts, None)
                
        # Fallback 3: Bỏ giới hạn khu vực
        if (filtered_df.empty or not self._has_hotel(filtered_df)) and districts:
            warning_msg = "Khu vực không có đủ dịch vụ. Đã mở rộng tìm kiếm toàn quốc."
            filtered_df = candidates.copy()

        if verbose:
            print(f"\nTrạng thái: {warning_msg}")
            print(f"Ứng viên đưa vào XGBoost: {min(len(filtered_df), base_top_k)}")

        # Giới hạn số lượng cho XGBoost
        if len(filtered_df) > base_top_k:
            filtered_df = filtered_df.head(base_top_k)
            
        # Stage 3: XGBRanker tính điểm
        features = self.dataset_builder._prepare_features(filtered_df)
        relevance_scores = self.xgb_model.predict(features)
        
        filtered_df = filtered_df.copy()
        filtered_df['Relevance_Score'] = relevance_scores
        filtered_df = filtered_df.sort_values('Relevance_Score', ascending=False).reset_index(drop=True)
        
        # Stage 4: Business Logic
        return self._apply_business_logic(filtered_df, warning_msg, verbose)

    def _apply_business_logic(
        self, 
        df: pd.DataFrame, 
        warning_msg: str, 
        verbose: bool
    ) -> Dict[str, Any]:
        """
        Quyết định cấu trúc đầu ra: 1 Hotel, 2 Dining, 3 Attractions.
        Phạt điểm nếu khác khu vực với khách sạn.
        """
        results = {'hotels': [], 'dining': [], 'attractions': []}
        
        # Tìm khách sạn tốt nhất làm tâm điểm
        hotel_df = df[df['Category'].str.contains('hotel', case=False, na=False)]
        if hotel_df.empty:
            return self._empty_response(warning_msg="Không tìm thấy khách sạn nào.")
            
        best_hotel = hotel_df.iloc[0].to_dict()
        hotel_district = self._extract_district(best_hotel.get('Address', ''))
        best_hotel['Reason'] = f"Lựa chọn lưu trú phù hợp nhất (Độ phù hợp: {best_hotel['Relevance_Score']:.2f})."
        results['hotels'].append(best_hotel)

        # Xử lý Dining và Attractions
        other_df = df[~df['Category'].str.contains('hotel', case=False, na=False)].copy()
        
        def calculate_adjusted_score(row):
            dist = self._extract_district(row.get('Address', ''))
            score = row['Relevance_Score']
            is_same_district = (dist == hotel_district and hotel_district != "Unknown")
            
            # Phạt 20% nếu khác khu vực
            final_score = score if is_same_district else score * 0.8
            
            reason = "Cùng khu vực với khách sạn, thuận tiện di chuyển " if is_same_district else "Khác khu vực với khách sạn "
            reason += f"(Độ phù hợp: {final_score:.2f})."
            return final_score, reason

        if not other_df.empty:
            other_df[['Final_Score', 'Reason']] = other_df.apply(
                lambda r: pd.Series(calculate_adjusted_score(r)), axis=1
            )
            other_df = other_df.sort_values('Final_Score', ascending=False)

            dining = other_df[other_df['Category'].str.contains('dining', case=False, na=False)].head(2)
            attractions = other_df[other_df['Category'].str.contains('attraction', case=False, na=False)].head(3)
            
            results['dining'] = dining.to_dict('records')
            results['attractions'] = attractions.to_dict('records')

        results['warning'] = warning_msg
        return results

    def _empty_response(self, warning_msg: str = "Không tìm thấy kết quả.") -> Dict[str, Any]:
        """Trả về cấu trúc rỗng khi không có kết quả."""
        return {
            'hotels': [], 
            'dining': [], 
            'attractions': [], 
            'warning': warning_msg
        }
    
    @property
    def total_items(self) -> int:
        """Tổng số địa điểm trong database."""
        return self.metadata.get('n_items', 0)
