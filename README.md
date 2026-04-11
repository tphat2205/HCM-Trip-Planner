# Vietnam Travel Planner

**Hệ thống tư vấn du lịch TP. Hồ Chí Minh.**

Ứng dụng web giúp du khách tìm kiếm và lên kế hoạch du lịch bằng cách nhập yêu cầu bằng ngôn ngữ tự nhiên tiếng Việt. Hệ thống sử dụng pipeline ML hai giai đoạn (Content-Based Filtering + XGBoost Ranker) để gợi ý khách sạn, quán ăn và điểm tham quan phù hợp nhất.

**Live Demo:** [hcm-trip-planner.vercel.app](https://hcm-trip-planner.vercel.app)

---

## Mục lục

- [Tính năng](#tính-năng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [ML Pipeline](#ml-pipeline)
- [Tech Stack](#tech-stack)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [API Reference](#api-reference)
- [Triển khai](#triển-khai)

---

## Tính năng

### Tìm kiếm thông minh

- **Nhập bằng ngôn ngữ tự nhiên**: _"Khách sạn yên tĩnh gần Quận 1"_, _"Quán ăn ngon, giá bình dân"_, _"Spa thư giãn, dịch vụ tốt"_
- **Gợi ý nhanh (Quick Suggestions)**: Các ví dụ mẫu giúp người dùng mới bắt đầu bằng một cú nhấp
- **Typewriter Animation**: Hiệu ứng gõ chữ hiển thị các ví dụ truy vấn

### Bộ lọc nâng cao

- **Lọc theo quận/huyện**: Chọn nhiều quận đồng thời (16 quận/huyện TP.HCM)
- **Lọc theo ngân sách**: Nhập tùy chỉnh hoặc chọn nhanh từ các mức preset (100K → 5M VNĐ)
- **Fallback thông minh 3 cấp**: Tự động nới lỏng tiêu chí nếu không tìm đủ kết quả

### Trực quan hóa kết quả

- **Thẻ địa điểm (ResultCard)**: Hiển thị hình ảnh, đánh giá, giá, giờ hoạt động, link gốc
- **Badge phân loại màu sắc**: Khách sạn (xanh dương) · Quán ăn (cam) · Điểm tham quan (tím)
- **Skeleton Loading**: Hiệu ứng tải mượt mà khi đang xử lý

### Bản đồ tương tác

- **Leaflet Map** giới hạn khu vực TP.HCM với marker tùy chỉnh theo danh mục
- **Hiển thị lộ trình**: Nối các điểm đã chọn bằng đường nét đứt animated
- **Auto-fit bounds**: Tự động zoom vừa khung tất cả marker
- **Geocoding**: Tọa độ chính xác từ database với fuzzy matching (ngưỡng 85%)

### Thời tiết & Ngân sách

- **Thời tiết real-time** từ OpenWeatherMap: nhiệt độ, độ ẩm, cảnh báo mưa
- **Ước tính ngân sách**: Biểu đồ tròn phân tách chi phí theo danh mục (Recharts)

### Trải nghiệm người dùng

- **Dark / Light Mode**: Tự động theo thiết lập hệ thống, lưu localStorage
- **Responsive layout**: Tương thích desktop và tablet
- **Framer Motion animations**: Hiệu ứng chuyển động mượt mà toàn bộ ứng dụng

---

## Kiến trúc hệ thống

```
┌─────────────────┐         HTTP/JSON          ┌─────────────────────┐
│                 │ ◄──────────────────────────►│                     │
│   React + Vite  │    GET /api/recommend       │   FastAPI Backend   │
│   (Frontend)    │    GET /api/weather          │   (Python 3.12)     │
│   Vercel        │                              │   Render            │
│                 │                              │                     │
│  • SearchBar    │                              │  • Routers          │
│  • FilterPanel  │                              │  • Services         │
│  • ResultCard   │                              │    ├─ recommender   │
│  • TravelMap    │                              │    ├─ weather       │
│  • WeatherDisplay                              │    └─ geocoding     │
│  • BudgetSummary│                              │  • ML Components    │
│                 │                              │    ├─ CBF (TF-IDF)  │
└─────────────────┘                              │    └─ XGBRanker     │
        │                                        └─────────┬───────────┘
        │                                                   │
   Leaflet / OSM                                    OpenWeatherMap API
   (Map Tiles)                                      (External Service)
```

---

## ML Pipeline

Khi người dùng gửi truy vấn, hệ thống thực hiện pipeline suy luận **4 giai đoạn**:

### Stage 1 — Candidate Retrieval (Content-Based Filtering)

Truy vấn được vector hóa bằng **TF-IDF** (max 5000 features, bigram) và tính **cosine similarity** với 500+ item profiles. Trích xuất top 500 ứng viên.

### Stage 2 — Hard Filtering & Smart Fallback

Áp dụng bộ lọc cứng theo quận/huyện và ngân sách. Cơ chế fallback 3 cấp:

1. Nới lỏng ngân sách +20%
2. Bỏ hoàn toàn ràng buộc ngân sách
3. Mở rộng phạm vi toàn thành phố

### Stage 3 — XGBoost Re-ranking

Top 100 ứng viên được đưa vào **XGBoost Ranker** để tính relevance score với features:

- Cosine similarity score
- Log-transformed price
- Điểm đánh giá (review score)
- Số lượng bình luận
- One-hot encoded category

### Stage 4 — Business Logic

Chọn **1 khách sạn + 2 quán ăn + 3 điểm tham quan** tốt nhất. Penalty 20% cho địa điểm khác quận với khách sạn nhằm tối ưu lộ trình.

---

## Tech Stack

### Backend

| Công nghệ   | Phiên bản | Mục đích                        |
| ------------ | --------- | ------------------------------- |
| FastAPI      | 0.135.2   | REST API framework              |
| Uvicorn      | 0.42.0    | ASGI server                     |
| XGBoost      | 3.2.0     | Learning-to-Rank model          |
| Scikit-learn | 1.8.0     | TF-IDF, OneHotEncoder           |
| Pandas       | 3.0.1     | Data processing                 |
| NumPy        | 2.4.2     | Numerical computing             |
| Pydantic     | 2.12.5    | Data validation & schemas       |
| httpx        | 0.28.1    | Async HTTP client (Weather API) |
| joblib       | 1.5.3     | Model serialization             |

### Frontend

| Công nghệ    | Phiên bản | Mục đích                  |
| ------------- | --------- | ------------------------- |
| React         | 19.2.4    | UI framework              |
| Vite          | 8.0.1     | Build tool & dev server   |
| Tailwind CSS  | 4.2.2     | Styling                   |
| Framer Motion | 12.38.0   | Animations & transitions  |
| Leaflet       | 1.9.4     | Interactive map           |
| react-leaflet | 5.0.0     | React wrapper cho Leaflet |
| Recharts      | 3.8.1     | Charts (budget pie chart) |
| Axios         | 1.14.0    | HTTP client               |
| Lucide React  | 1.7.0     | Icons                     |

### DevOps

| Công nghệ     | Mục đích                    |
| -------------- | --------------------------- |
| Docker         | Containerization            |
| Docker Compose | Multi-service orchestration |
| Render         | Backend hosting             |
| Vercel         | Frontend hosting            |

---

## Cấu trúc thư mục

```
TripPlanner/
├── docker-compose.yml            # Docker orchestration
├── README.md
│
├── backend/                      # Python FastAPI server
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env                      # Environment variables (gitignored)
│   ├── .env.example              # Template cho .env
│   └── app/
│       ├── main.py               # Entry point, app factory, lifespan
│       ├── core/
│       │   ├── config.py         # Pydantic settings (env vars)
│       │   └── dependencies.py   # Dependency injection (recommender, geocoding)
│       ├── models/
│       │   └── schemas.py        # Request/Response Pydantic models
│       ├── routers/
│       │   ├── health.py         # GET /health
│       │   ├── recommendations.py # GET|POST /api/recommend
│       │   └── utilities.py      # GET /api/weather
│       ├── services/
│       │   ├── ml_components.py  # ContentBasedFilter, LearningToRankDataset
│       │   ├── recommender.py    # VietnamTourismRecommender (4-stage pipeline)
│       │   ├── geocoding.py      # LocationService (JSON + fuzzy matching)
│       │   └── weather.py        # WeatherService (OpenWeatherMap)
│       ├── artifacts/            # Serialized ML model files (.pkl)
│       │   ├── vietnam_tourism_cbf.pkl          # TF-IDF vectorizer + profiles (~35MB)
│       │   ├── vietnam_tourism_xgbranker.pkl    # XGBoost Ranker model (~0.8MB)
│       │   ├── vietnam_tourism_encoder.pkl      # Category OneHotEncoder
│       │   └── vietnam_tourism_metadata.pkl     # Model metadata
│       └── public/
│           └── map_locations.json # Geocoding database (~644KB)
│
└── frontend/                     # React + Vite app
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx              # React entry point
        ├── App.jsx               # Root component, state management
        ├── App.css               # Global styles
        ├── api.js                # Axios API client
        └── components/
            ├── SearchBar.jsx     # Thanh tìm kiếm + typewriter + quick suggestions
            ├── FilterPanel.jsx   # Bộ lọc quận/huyện + ngân sách
            ├── ResultCard.jsx    # Thẻ hiển thị địa điểm + skeleton loader
            ├── TravelMap.jsx     # Bản đồ Leaflet + routing + markers
            ├── WeatherDisplay.jsx # Widget thời tiết (pill + dropdown)
            ├── BudgetSummary.jsx # Ước tính ngân sách + pie chart
            └── AboutModal.jsx    # Modal giới thiệu dự án
```

---

## API Reference

Base URL: `https://<render-backend-url>`

### `GET /health`

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "version": "2.0.0",
  "model_loaded": true,
  "total_items": 542
}
```

### `GET /api/recommend`

Lấy gợi ý địa điểm du lịch.

**Parameters:**

| Param       | Type   | Required | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| `query`     | string | Yes      | Truy vấn ngôn ngữ tự nhiên (1-500 ký tự)    |
| `districts` | string | No       | Danh sách quận, phân cách bởi dấu phẩy      |
| `max_price` | float  | No       | Ngân sách tối đa (VNĐ, >= 0)                |

**Ví dụ:**

```
GET /api/recommend?query=khách sạn đẹp&districts=Quận 1,Quận 3&max_price=2000000
```

**Response:**

```json
{
  "hotels": [
    {
      "id": "uuid",
      "name": "Khách sạn ABC",
      "category": "hotel",
      "address": "123 Đường XYZ, Quận 1, TP.HCM",
      "district": "Quận 1",
      "price_min": 500000,
      "price_max": 1200000,
      "score": 8.5,
      "start_time": "00:00",
      "end_time": "23:59",
      "url": "https://...",
      "relevance_score": 0.87,
      "reason": "Lựa chọn lưu trú phù hợp nhất",
      "lat": 10.7769,
      "lng": 106.7009
    }
  ],
  "restaurants": [],
  "attractions": [],
  "warning": "Thỏa mãn toàn bộ tiêu chí tìm kiếm.",
  "total_places": 6,
  "estimated_budget": 1500000
}
```

### `POST /api/recommend`

Cùng chức năng với GET, nhận JSON body thay vì query params.

**Body:**

```json
{
  "query": "Quán ăn ngon Quận 3",
  "districts": ["Quận 3"],
  "max_price": 500000
}
```

### `GET /api/weather`

Lấy thông tin thời tiết hiện tại.

**Parameters:**

| Param  | Type   | Required | Description                                   |
| ------ | ------ | -------- | --------------------------------------------- |
| `city` | string | No       | Tên thành phố (mặc định: "Ho Chi Minh City")  |

**Response:**

```json
{
  "success": true,
  "data": {
    "city": "Ho Chi Minh City",
    "temperature": 32.5,
    "feels_like": 38.0,
    "humidity": 70,
    "description": "Partly cloudy",
    "icon": "03d",
    "wind_speed": 3.5,
    "is_outdoor_friendly": true
  }
}
```

---

## Triển khai

Ứng dụng được triển khai trên hai nền tảng:

| Thành phần | Nền tảng | URL                                                              |
| ---------- | -------- | ---------------------------------------------------------------- |
| Frontend   | Vercel   | [hcm-trip-planner.vercel.app](https://hcm-trip-planner.vercel.app) |
| Backend    | Render   | Swagger UI tại `/docs`                                           |

### Biến môi trường (Backend)

| Biến                       | Mô tả                                         | Mặc định    |
| -------------------------- | ---------------------------------------------- | ----------- |
| `DEBUG`                    | Chế độ debug (True/False)                      | `True`      |
| `HOST`                     | Host server                                    | `0.0.0.0`   |
| `PORT`                     | Port server                                    | `8000`      |
| `OPENWEATHERMAP_API_KEY`   | API key từ OpenWeatherMap (để trống nếu không cần) | _(trống)_ |

Frontend sử dụng biến `VITE_API_URL` trỏ tới backend URL (mặc định: `http://localhost:8000/api`).

---

## License

Dự án này được phát triển cho mục đích học thuật.
