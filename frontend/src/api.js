import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get AI-powered recommendations with filters
export const getRecommendations = async (query, options = {}) => {
  const { 
    numHotels = 1, 
    numRestaurants = 2, 
    numAttractions = 3,
    districts = [],
    minPrice = null,
    maxPrice = null
  } = options;
  
  const params = {
    query,
    num_hotels: numHotels,
    num_restaurants: numRestaurants,
    num_attractions: numAttractions,
  };

  // Add optional filters
  if (districts && districts.length > 0) {
    params.districts = districts.join(',');
  }
  if (minPrice !== null && minPrice !== '') {
    params.min_price = minPrice;
  }
  if (maxPrice !== null && maxPrice !== '') {
    params.max_price = maxPrice;
  }
  
  const response = await api.get('/recommend', { params });
  
  return response.data;
};

// Get available districts for filtering
export const getDistricts = async () => {
  const response = await api.get('/districts');
  return response.data.districts;
};

// Get all locations with optional filters
export const getLocations = async (filters = {}) => {
  const response = await api.get('/locations', { params: filters });
  return response.data;
};

// Get a single location by ID
export const getLocationById = async (id) => {
  const response = await api.get(`/locations/${id}`);
  return response.data;
};

// Get weather for a city
export const getWeather = async (city) => {
  const response = await api.get(`/weather/${encodeURIComponent(city)}`);
  return response.data;
};

// Get list of all cities
export const getCities = async () => {
  const response = await api.get('/cities');
  return response.data;
};

// Get search suggestions
export const getSearchSuggestions = async (query) => {
  const response = await api.get('/search-suggestions', {
    params: { q: query },
  });
  return response.data;
};

// Calculate budget for itinerary
export const calculateBudget = async (items) => {
  const response = await api.post('/calculate-budget', items);
  return response.data;
};

// Geocode an address
export const geocodeAddress = async (address) => {
  const response = await api.get('/geocode', {
    params: { address },
  });
  return response.data;
};

export default api;
