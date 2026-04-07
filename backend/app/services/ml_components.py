"""
Machine Learning components for the recommendation system.

Contains:
- ContentBasedFilter: TF-IDF based candidate generation (Stage 1)
- LearningToRankDataset: Feature engineering for XGBoost (Stage 2)
"""

import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder


class ContentBasedFilter:
    """
    Content-Based Filtering để tạo danh sách ứng viên (Candidate Generation).
    
    Cách hoạt động:
    1. Xây dựng Profile cho mỗi Item từ tập dữ liệu huấn luyện
    2. Sử dụng TF-IDF để vector hóa documents
    3. Tính Cosine Similarity giữa query và item profiles
    4. Trả về Top K ứng viên
    """
    
    def __init__(self, top_k: int = 100):
        """
        Khởi tạo ContentBasedFilter.
        
        Args:
            top_k: Số lượng ứng viên tối đa trả về cho mỗi truy vấn.
        """
        self.top_k = top_k
        
        # Vectorizer và trạng thái model
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.item_profiles: Optional[pd.DataFrame] = None
        self.item_vectors = None
        self.item_names: List[str] = []
        
        # Dictionary map để tra cứu metadata O(1)
        self.item_profile_map: Dict[str, Dict] = {}
        
    def _build_item_document(self, group: pd.DataFrame) -> str:
        """Xây dựng Document đại diện cho một địa điểm."""
        comments = group['Comment'].astype(str).tolist()
        comments_text = ' '.join(comments)
        
        category = str(group['Category'].iloc[0]) if 'Category' in group.columns else ''
        address = str(group['Address'].iloc[0]) if 'Address' in group.columns else ''
        
        return f"{category} {address} {comments_text}".strip()
    
    def fit(self, df_train: pd.DataFrame) -> 'ContentBasedFilter':
        """
        Huấn luyện model Content-Based trên tập dữ liệu train.
        
        Args:
            df_train: DataFrame chứa dữ liệu huấn luyện.
            
        Returns:
            Self after fitting.
        """
        print("\n" + "#" * 60)
        print("# GIAI ĐOẠN 1: CONTENT-BASED FILTERING")
        print("#" * 60)
        
        print("\nBước 1: Xây dựng Item Profiles từ tập train...")
        
        item_documents: Dict[str, str] = {}
        item_metadata: Dict[str, Dict] = {}
        
        for name, group in df_train.groupby('Name'):
            document = self._build_item_document(group)
            item_documents[name] = document
            
            item_metadata[name] = {
                'Category': group['Category'].iloc[0] if 'Category' in group.columns else None,
                'Address': group['Address'].iloc[0] if 'Address' in group.columns else None,
                'Price_min': group['Price_min'].iloc[0] if 'Price_min' in group.columns else None,
                'Score': group['Score'].iloc[0] if 'Score' in group.columns else None,
                'Nums_comments': len(group),
                'Start': group['Start'].iloc[0] if 'Start' in group.columns else None,
                'End': group['End'].iloc[0] if 'End' in group.columns else None,
                'Price_max': group['Price_max'].iloc[0] if 'Price_max' in group.columns else None,
                'Url': group['Url'].iloc[0] if 'Url' in group.columns else None,
            }
        
        self.item_names = list(item_documents.keys())
        documents = list(item_documents.values())
        print(f"  - Đã xây dựng {len(self.item_names)} Item Profiles")
        
        self.item_profiles = pd.DataFrame.from_dict(item_metadata, orient='index')
        self.item_profiles.index.name = 'Name'
        self.item_profiles = self.item_profiles.reset_index()

        self.item_profile_map = {}
        for name, meta in item_metadata.items():
            row = dict(meta)
            row['Name'] = name
            self.item_profile_map[name] = row
        
        print("\nBước 2: Fit TF-IDF Vectorizer...")
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95,
            sublinear_tf=True
        )
        
        self.item_vectors = self.tfidf_vectorizer.fit_transform(documents)
        
        print(f"  - Vocabulary size: {len(self.tfidf_vectorizer.vocabulary_)}")
        print(f"  - Item vectors shape: {self.item_vectors.shape}")
        
        return self
    
    def _get_top_indices(self, similarities: np.ndarray, top_k: int) -> np.ndarray:
        """Lấy indices của top K phần tử lớn nhất."""
        if top_k >= len(similarities):
            return np.argsort(similarities)[::-1]

        top_unsorted = np.argpartition(similarities, -top_k)[-top_k:]
        return top_unsorted[np.argsort(similarities[top_unsorted])[::-1]]

    def get_candidates(self, query: str, top_k: Optional[int] = None) -> pd.DataFrame:
        """
        Truy xuất Top K địa điểm ứng viên cho một truy vấn.
        
        Args:
            query: Câu truy vấn của người dùng.
            top_k: Số lượng ứng viên trả về.
            
        Returns:
            DataFrame chứa thông tin ứng viên kèm Cosine Similarity Score.
        """
        if self.tfidf_vectorizer is None or self.item_vectors is None:
            raise ValueError("Model chưa được fit! Hãy gọi fit() trước.")
        
        if top_k is None:
            top_k = self.top_k
            
        query_vector = self.tfidf_vectorizer.transform([query])
        similarities = cosine_similarity(query_vector, self.item_vectors).flatten()
        top_indices = self._get_top_indices(similarities, top_k)
        
        candidates = []
        for idx in top_indices:
            name = self.item_names[idx]
            item_info = self.item_profile_map.get(name)
            if item_info is None:
                continue
            
            row = dict(item_info)
            row['Cosine_Similarity_Score'] = float(similarities[idx])
            candidates.append(row)
            
        return pd.DataFrame(candidates)
    
    def get_candidates_batch(self, queries: List[str], top_k: Optional[int] = None) -> List[pd.DataFrame]:
        """Truy xuất ứng viên cho nhiều truy vấn cùng lúc (batch processing)."""
        if self.tfidf_vectorizer is None or self.item_vectors is None:
            raise ValueError("Model chưa được fit! Hãy gọi fit() trước.")
        
        if top_k is None:
            top_k = self.top_k
            
        query_vectors = self.tfidf_vectorizer.transform(queries)
        all_similarities = cosine_similarity(query_vectors, self.item_vectors)
        
        results = []
        for similarities in all_similarities:
            top_indices = self._get_top_indices(similarities, top_k)
            candidates = []
            for idx in top_indices:
                name = self.item_names[idx]
                item_info = self.item_profile_map.get(name)
                if item_info is None:
                    continue
                row = dict(item_info)
                row['Cosine_Similarity_Score'] = float(similarities[idx])
                candidates.append(row)
            results.append(pd.DataFrame(candidates))
            
        return results


class LearningToRankDataset:
    """
    Class xây dựng tập dữ liệu dạng bảng phù hợp với Learning-to-Rank.
    """
    
    def __init__(self, cbf: 'ContentBasedFilter', top_k: int = 30):
        """
        Khởi tạo dataset builder.
        
        Args:
            cbf: ContentBasedFilter đã được huấn luyện.
            top_k: Số lượng ứng viên cần lấy cho mỗi Query.
        """
        self.cbf = cbf
        self.top_k = top_k
        self.category_encoder: Optional[OneHotEncoder] = None
        self.feature_columns: List[str] = []
        
    def _prepare_features(self, candidates_df: pd.DataFrame, fit_encoder: bool = False) -> pd.DataFrame:
        """
        Chuẩn bị và biến đổi features cho model dự đoán.
        
        Args:
            candidates_df: DataFrame chứa thông tin thô của ứng viên.
            fit_encoder: True khi xử lý tập Train để encoder học categories.
        """
        df = candidates_df.copy()
        
        # Điền giá trị khuyết và ép kiểu
        df['Price_min'] = df['Price_min'].fillna(0).astype(float)
        df['Score'] = df['Score'].fillna(0).astype(float)
        df['Nums_comments'] = df['Nums_comments'].fillna(0).astype(float)
        df['Cosine_Similarity_Score'] = df['Cosine_Similarity_Score'].fillna(0).astype(float)
        
        # Log scale cho Price
        df['Price_min_log'] = np.log1p(df['Price_min'])
        
        # One-hot encoding cho Category
        if fit_encoder or self.category_encoder is None:
            self.category_encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
            category_encoded = self.category_encoder.fit_transform(df[['Category']].fillna('Unknown'))
        else:
            category_encoded = self.category_encoder.transform(df[['Category']].fillna('Unknown'))
        
        category_cols = [f'Category_{cat}' for cat in self.category_encoder.categories_[0]]
        category_df = pd.DataFrame(category_encoded, columns=category_cols, index=df.index)
        
        # Concat features
        features = pd.concat([
            df[['Cosine_Similarity_Score', 'Price_min_log', 'Score', 'Nums_comments']],
            category_df
        ], axis=1)

        features = features.astype(np.float32)
        self.feature_columns = features.columns.tolist()
        return features
    
    def build_dataset(
        self, 
        df: pd.DataFrame, 
        fit_encoder: bool = False,
        verbose: bool = True
    ) -> Tuple[pd.DataFrame, np.ndarray, np.ndarray]:
        """
        Xây dựng dataset cho XGBoost LTR.
        
        Returns:
            X: Ma trận features
            y: Nhãn relevance (1 nếu đúng, 0 nếu sai)
            qid: Query IDs
        """
        if verbose:
            print(f"\nĐang xây dựng tập dữ liệu LTR từ {len(df)} lượt truy vấn...")

        if len(df) == 0:
            if verbose:
                print("  - Tập dữ liệu rỗng")
            return pd.DataFrame(), np.array([], dtype=np.int32), np.array([], dtype=np.int32)
        
        queries = df['Comment'].astype(str).tolist()
        ground_truths = df['Name'].tolist()
        
        candidates_list = self.cbf.get_candidates_batch(queries, top_k=self.top_k)
        
        candidates_per_query = [c.reset_index(drop=True) for c in candidates_list if len(c) > 0]
        if not candidates_per_query:
            if verbose:
                print("  - Không tìm thấy ứng viên nào")
            return pd.DataFrame(), np.array([], dtype=np.int32), np.array([], dtype=np.int32)

        qid_parts = [np.full(len(c), i, dtype=np.int32) for i, c in enumerate(candidates_list) if len(c) > 0]
        gt_parts = [np.full(len(c), gt, dtype=object) for c, gt in zip(candidates_list, ground_truths) if len(c) > 0]

        candidates_all = pd.concat(candidates_per_query, ignore_index=True)
        qid = np.concatenate(qid_parts)
        repeated_gt = np.concatenate(gt_parts)

        X = self._prepare_features(candidates_all, fit_encoder=fit_encoder).reset_index(drop=True)
        y = (candidates_all['Name'].values == repeated_gt).astype(np.int32)
        
        if len(qid) > 1 and np.any(qid[:-1] > qid[1:]):
            sort_indices = np.argsort(qid)
            X = X.iloc[sort_indices].reset_index(drop=True)
            y = y[sort_indices]
            qid = qid[sort_indices]
        
        if verbose:
            positive_count = y.sum()
            num_queries = len(np.unique(qid))
            print(f"  - Tổng số mẫu: {len(X):,}")
            print(f"  - Số lượng truy vấn: {num_queries:,}")
            print(f"  - Mẫu positive (y=1): {positive_count:,} ({positive_count/len(y)*100:.2f}%)")
        
        return X, y, qid
