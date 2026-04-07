# Vietnam Travel Planner

A travel recommendation system for Vietnam tourism, built with FastAPI + React + ML models.

### Backend
- **FastAPI**: REST API server
- **Recommender System**: 2-stage pipeline
  - Stage 1: TF-IDF Content-Based Filtering (Top 100 candidates)
  - Stage 2: XGBoost Ranking (Price, Score, Category features)
- **Data**: 70+ locations across major Vietnamese cities
- **Weather API**: Mock data (ready for OpenWeatherMap integration)
- **Geocoding**: Using MapBox API for address → coordinates

### Frontend
- **React** with Vite for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Leaflet.js** for interactive maps with routing
- **Recharts** for budget visualization
- **jsPDF** for PDF export