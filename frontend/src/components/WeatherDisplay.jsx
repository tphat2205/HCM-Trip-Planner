import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudSun, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { getWeather } from '../api';

const weatherIcons = {
  'sun': Sun,
  'cloud': Cloud,
  'cloud-rain': CloudRain,
  'cloud-sun': CloudSun,
};

const weatherColors = {
  'Sunny': 'from-yellow-400 to-orange-400',
  'Hot': 'from-red-400 to-orange-500',
  'Partly Cloudy': 'from-blue-400 to-gray-400',
  'Cloudy': 'from-gray-400 to-gray-500',
  'Rainy': 'from-blue-500 to-gray-600',
  'Cool': 'from-teal-400 to-blue-400',
  'Unknown': 'from-gray-400 to-gray-500',
};

export default function WeatherDisplay({ city, attractions = [] }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWeather(city);
        setWeather(data);
      } catch (err) {
        setError('Không thể tải thời tiết');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  if (!city) return null;

  if (loading) {
    return (
      <motion.div
        className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center h-24">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-white/20 rounded" />
              <div className="h-4 w-24 bg-white/20 rounded" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !weather || !weather.data) return null;

  const weatherData = weather.data;
  const WeatherIcon = weatherIcons[weatherData.icon] || Cloud;
  const gradientClass = weatherColors[weatherData.description] || weatherColors['Unknown'];
  
  // Check if it's rainy and user has outdoor attractions
  const isRainy = weatherData.description?.toLowerCase().includes('rain') || !weatherData.is_outdoor_friendly;
  const hasOutdoorAttractions = attractions.some(a => a.category === 'Attraction');
  const showWarning = isRainy && hasOutdoorAttractions;

  return (
    <motion.div
      className={`bg-gradient-to-r ${gradientClass} rounded-2xl p-6 text-white overflow-hidden relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-10">
        <WeatherIcon className="h-48 w-48 -mr-12 -mt-12" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Thời tiết</h3>
            <p className="text-2xl font-bold">{weatherData.city}</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <WeatherIcon className="h-12 w-12" />
          </motion.div>
        </div>
        
        {/* Temperature */}
        <div className="flex items-end gap-4 mb-4">
          <div className="text-5xl font-bold">{weatherData.temperature}°C</div>
          <div className="text-lg opacity-90 pb-1">{weatherData.description}</div>
        </div>
        
        {/* Details */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 opacity-75" />
            <span>Cảm giác: {weatherData.feels_like}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 opacity-75" />
            <span>Độ ẩm: {weatherData.humidity}%</span>
          </div>
        </div>
        
        {/* Weather Warning */}
        {showWarning && (
          <motion.div
            className="mt-4 p-3 bg-white/20 rounded-xl flex items-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Cảnh báo mưa!</p>
              <p className="opacity-90">
                Có thể ảnh hưởng đến các địa điểm tham quan ngoài trời. Hãy mang theo ô hoặc áo mưa.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
