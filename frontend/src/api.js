import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lấy danh sách gợi ý địa điểm từ AI (Dùng trong App.jsx)
export const getRecommendations = async (query, options = {}) => {
  const { numHotels = 1, numRestaurants = 2, numAttractions = 3, districts = [], minPrice, maxPrice } = options;
  
  const params = {
    query,
    num_hotels: numHotels,
    num_restaurants: numRestaurants,
    num_attractions: numAttractions,
    ...(districts.length && { districts: districts.join(',') }),
    ...(minPrice && { min_price: minPrice }),
    ...(maxPrice && { max_price: maxPrice }),
  };

  const { data } = await api.get('/recommend', { params });
  return data;
};

// Lấy thời tiết (Dùng trong WeatherDisplay.jsx)
export const getWeather = async (city) => {
  const { data } = await api.get(`/weather?city=${city}`);
  return data;
};

export default api;