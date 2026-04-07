# Vietnam AI Travel Planner

AI-powered travel recommendation system for Vietnam tourism, built with FastAPI + React + ML models.

## 🚀 Quick Start

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
# Backend runs at http://localhost:8000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

## 🏗️ Architecture

### Backend
- **FastAPI**: REST API server
- **Recommender System**: 2-stage pipeline
  - Stage 1: TF-IDF Content-Based Filtering (Top 100 candidates)
  - Stage 2: XGBoost Ranking (Price, Score, Category features)
- **Data**: 70+ locations across major Vietnamese cities
- **Weather API**: Mock data (ready for OpenWeatherMap integration)
- **Geocoding**: Nominatim (OpenStreetMap) for address → coordinates

### Frontend
- **React** with Vite for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Leaflet.js** for interactive maps with routing
- **Recharts** for budget visualization
- **jsPDF** for PDF export

## 📦 Features

✅ **Smart Search** - Natural language query processing with typing animation  
✅ **AI Recommendations** - Returns exactly 1 Hotel, 2 Restaurants, 3 Attractions  
✅ **Interactive Map** - Leaflet with custom markers and route optimization  
✅ **Budget Breakdown** - Pie chart visualization of estimated costs  
✅ **Weather Display** - Mock weather with outdoor activity warnings  
✅ **PDF Export** - Download full itinerary as PDF  
✅ **Dark Mode** - Full dark theme support  
✅ **Responsive Design** - Mobile-friendly layout  

## 🎯 API Endpoints

```
GET  /                          # Health check
GET  /api/recommend             # Get AI recommendations
GET  /api/locations             # Get all locations (with filters)
GET  /api/locations/{id}        # Get specific location
GET  /api/weather/{city}        # Get weather (mock data)
GET  /api/geocode               # Convert address to coordinates
GET  /api/cities                # List all cities
POST /api/calculate-budget      # Calculate itinerary budget
GET  /api/search-suggestions    # Get search suggestions
```

## 🧪 Test Queries

Try these in the search bar:
- "Du lịch Đà Nẵng cuối tuần"
- "Khách sạn 5 sao Hà Nội"
- "Quán ăn ngon Hội An"
- "Địa điểm tham quan Huế"
- "Resort biển Phú Quốc"

## 📊 Data

Mock data includes:
- **8 cities**: Hà Nội, Đà Nẵng, Hội An, Huế, HCM, Nha Trang, Phú Quốc, Đà Lạt
- **70+ locations**: Hotels, Restaurants, Attractions
- Each location has: coordinates, price range, rating, description, images

## 🔧 Configuration

### CORS (Backend)
Allowed origins:
- http://localhost:5173
- http://localhost:3000
- http://127.0.0.1:5173

### Environment Variables (Optional)
```
# Backend
PORT=8000
HOST=0.0.0.0

# Frontend
VITE_API_URL=http://localhost:8000
```

## 🚀 Production Deployment

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Frontend
```bash
# Build
npm run build

# Preview
npm run preview

# Deploy dist/ folder to hosting (Vercel, Netlify, etc.)
```

## 📝 Future Enhancements

- [ ] Replace mock ML models with real trained models (.pkl files)
- [ ] Integrate real OpenWeatherMap API (with user's API key)
- [ ] Add user authentication and save itineraries
- [ ] Hotel booking integration
- [ ] Multi-language support
- [ ] Advanced route optimization algorithms
- [ ] Real-time collaborative trip planning

## 🛠️ Tech Stack

**Backend:**
- FastAPI 0.109.0
- XGBoost 2.0.3
- scikit-learn 1.4.0
- Pandas 2.1.4
- Pydantic 2.5.3

**Frontend:**
- React 19.2.4
- Vite 8.0.1
- Tailwind CSS
- Framer Motion
- Leaflet.js
- Recharts
- Axios
- jsPDF

## 📄 License

MIT License - Feel free to use this for your projects!

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---
