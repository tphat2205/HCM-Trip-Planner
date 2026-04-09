import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudSun, Thermometer, Droplets, AlertTriangle, ChevronDown } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false); // Thêm state đóng/mở

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
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg flex items-center gap-2 border border-gray-200 dark:border-gray-700">
        <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Đang tải...</span>
      </div>
    );
  }

  if (error || !weather || !weather.data) return null;

  const weatherData = weather.data;
  const WeatherIcon = weatherIcons[weatherData.icon] || Cloud;
  const gradientClass = weatherColors[weatherData.description] || weatherColors['Unknown'];
  
  const isRainy = weatherData.description?.toLowerCase().includes('rain') || !weatherData.is_outdoor_friendly;
  const hasOutdoorAttractions = attractions.some(a => a.category === 'Attraction');
  const showWarning = isRainy && hasOutdoorAttractions;

  return (
    <div className="relative">
      {/* Nút thu gọn dạng Pill */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 hover:bg-white dark:hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`p-1 rounded-full bg-linear-to-br ${gradientClass}`}>
          <WeatherIcon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
          {weatherData.temperature}°C
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Panel thả xuống (Dropdown) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-[calc(100%+8px)] left-0 w-64 bg-linear-to-br ${gradientClass} rounded-2xl p-4 text-white shadow-xl backdrop-blur-md border border-white/20 overflow-hidden z-50`}
          >
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-80 uppercase tracking-wider">{weatherData.city}</p>
                  <p className="text-lg font-bold truncate">{weatherData.description}</p>
                </div>
                <WeatherIcon className="h-10 w-10 opacity-90" />
              </div>
              
              <div className="flex items-center gap-4 pt-2 border-t border-white/20">
                <div className="flex items-center gap-1.5 text-xs">
                  <Thermometer className="h-3.5 w-3.5 opacity-75" />
                  <span>Cảm giác: {weatherData.feels_like}°C</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Droplets className="h-3.5 w-3.5 opacity-75" />
                  <span>Độ ẩm: {weatherData.humidity}%</span>
                </div>
              </div>

              {showWarning && (
                <div className="mt-1 p-2 bg-black/20 rounded-lg flex items-start gap-2 border border-white/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-300 shrink-0 mt-0.5" />
                  <p className="text-xs text-white/90 font-medium">Có thể mưa, ảnh hưởng lịch trình ngoài trời.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}