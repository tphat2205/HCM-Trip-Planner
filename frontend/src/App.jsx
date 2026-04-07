import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Sparkles, List, Trash2 } from 'lucide-react';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import ResultCard, { ResultCardSkeleton } from './components/ResultCard';
import TravelMap from './components/TravelMap';
import BudgetSummary from './components/BudgetSummary';
import WeatherDisplay from './components/WeatherDisplay';
import ExportPDF from './components/ExportPDF';
import { getRecommendations } from './api';

function App() {
  const [results, setResults] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [filters, setFilters] = useState({
    districts: [],
    minPrice: null,
    maxPrice: null,
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);
    
    try {
      const data = await getRecommendations(query, {
        districts: filters.districts,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
      setResults(data);
      
      // Extract city from results
      const allLocations = [
        ...(data.hotels || []),
        ...(data.restaurants || []),
        ...(data.attractions || []),
      ];
      if (allLocations.length > 0) {
        // Default to HCM since we're focusing on HCMC
        setSelectedCity('Hồ Chí Minh');
      }
      
      // Show warning if any
      if (data.warning && data.warning !== "Thỏa mãn toàn bộ tiêu chí tìm kiếm.") {
        console.log('API Warning:', data.warning);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Không thể tìm kiếm. Vui lòng kiểm tra Backend có đang chạy không.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToTrip = (location) => {
    const isInTrip = itinerary.some(item => item.id === location.id);
    
    if (isInTrip) {
      // Remove from trip
      setItinerary(itinerary.filter(item => item.id !== location.id));
    } else {
      // Add to trip
      setItinerary([...itinerary, location]);
    }
  };

  const clearItinerary = () => {
    setItinerary([]);
  };

  const allResults = results
    ? [
        ...(results.hotels || []),
        ...(results.restaurants || []),
        ...(results.attractions || []),
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.header
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Plane className="h-8 w-8 text-emerald-500" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Vietnam AI Travel Planner
            </h1>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Lên kế hoạch du lịch Việt Nam thông minh với AI
          </p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-6">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Filter Section */}
        <section className="mb-8">
          <FilterPanel onFiltersChange={handleFiltersChange} isLoading={isLoading} />
        </section>

        {/* Error Display */}
        {error && (
          <motion.div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="text-sm text-red-500 dark:text-red-500 mt-2">
              Hãy chắc chắn Backend đang chạy tại http://localhost:8000
            </p>
          </motion.div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Đang tìm kiếm...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ResultCardSkeleton key={i} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Results Section */}
        {!isLoading && results && allResults.length > 0 && (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Kết quả tìm kiếm
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {allResults.length} địa điểm
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allResults.map((location, index) => (
                <ResultCard
                  key={location.id}
                  location={location}
                  onAddToTrip={handleAddToTrip}
                  isInTrip={itinerary.some(item => item.id === location.id)}
                  index={index}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Itinerary Section */}
        {itinerary.length > 0 && (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <List className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Hành trình của bạn
                </h2>
                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                  {itinerary.length} địa điểm
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ExportPDF itinerary={itinerary} query={currentQuery} />
                <motion.button
                  onClick={clearItinerary}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa tất cả
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Map + Weather */}
              <div className="lg:col-span-2 space-y-6">
                <TravelMap
                  locations={itinerary}
                  onLocationSelect={(loc) => console.log('Selected:', loc)}
                />
                
                {selectedCity && (
                  <WeatherDisplay
                    city={selectedCity}
                    attractions={itinerary.filter(item => item.category === 'Attraction')}
                  />
                )}
              </div>

              {/* Right Column: Budget */}
              <div>
                <BudgetSummary itinerary={itinerary} />
              </div>
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {!isLoading && !results && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Plane className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Bắt đầu hành trình của bạn
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Nhập địa điểm bạn muốn đến để nhận gợi ý AI
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            Powered by <span className="font-semibold text-emerald-600">AI</span> • Made with ❤️ for Vietnam Tourism
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
