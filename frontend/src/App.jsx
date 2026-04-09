import { useState } from 'react';
import { Plane, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import ResultCard, { ResultCardSkeleton } from './components/ResultCard';
import TravelMap from './components/TravelMap';
import WeatherDisplay from './components/WeatherDisplay';
import { getRecommendations } from './api';

function App() {
  const [results, setResults] = useState(null);
  // KHÔI PHỤC STATE: Dùng để lưu những địa điểm người dùng chủ động chọn lên bản đồ
  const [selectedLocations, setSelectedLocations] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
    setSelectedLocations([]); // Reset bản đồ trống trơn khi tìm kiếm mới
    
    try {
      const data = await getRecommendations(query, {
        districts: filters.districts,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
      setResults(data);
      
      const allLocations = [
        ...(data.hotels || []),
        ...(data.restaurants || []),
        ...(data.attractions || [])
      ];
      if (allLocations.length > 0) {
        setSelectedCity('Ho Chi Minh'); 
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý bật/tắt địa điểm trên bản đồ
  const handleToggleLocation = (location) => {
    if (selectedLocations.find(item => item.id === location.id)) {
      // Nếu đã có thì xóa khỏi bản đồ
      setSelectedLocations(selectedLocations.filter(item => item.id !== location.id));
    } else {
      // Nếu chưa có thì thêm vào bản đồ
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const allResults = results ? [
    ...(results.hotels || []),
    ...(results.restaurants || []),
    ...(results.attractions || [])
  ] : [];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col">
      
      {/* HEADER */}
      <header className="shrink-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/30">
              <Plane className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Vietnam Travel Planner
            </h1>
          </div>
          
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full px-4 py-4 flex flex-col lg:flex-row gap-4 overflow-hidden">
        
        {/* ================= CỘT TRÁI: Tìm kiếm + Kết quả ================= */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* Vùng Search cố định */}
          <div className="shrink-0 space-y-4">
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={isLoading}
              filterNode={
                <FilterPanel onFiltersChange={handleFiltersChange} isLoading={isLoading} />
              }
            />
            
            {/* {selectedCity && (
              <div className="flex flex-wrap gap-4 items-center">
                <WeatherDisplay city={selectedCity} />
              </div>
            )} */}
          </div>

          {/* Vùng danh sách */}
          <div className="flex-1 overflow-hidden flex flex-col pb-2">
            {isLoading && (
              <div className="h-full flex flex-col">
                <div className="grid grid-cols-3 gap-3 h-full">
                  {[1, 2, 3, 4, 5, 6].map(i => <ResultCardSkeleton key={i} index={i} />)}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {!isLoading && allResults.length === 0 && (
              <motion.div
                className={`relative rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 h-full`}
                layout
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Navigation className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nhập nhu cầu của bạn để tìm kiếm địa điểm</p>
                  </div>
                </div>
              </motion.div>
            )}

            {!isLoading && allResults.length > 0 && (
              <section className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                      Gợi ý phù hợp nhất
                    </h2>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-1 rounded-full">
                      {allResults.length} địa điểm
                    </span>
                  </div>
                  
                  {/* Text báo hiệu số lượng đang nhúng trên bản đồ */}
                  {selectedLocations.length > 0 && (
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Đã chọn: {selectedLocations.length} lên bản đồ
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 h-full">
                  {allResults.map((location, index) => (
                    <ResultCard
                      key={location.id}
                      location={location}
                      // Bật lại chức năng chọn bằng hàm Toggle
                      onAddToTrip={() => handleToggleLocation(location)} 
                      isInTrip={selectedLocations.some(item => item.id === location.id)}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ================= CỘT PHẢI: Bản Đồ ================= */}
        <div className="w-full lg:w-1/2 h-full relative z-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Truyền selectedLocations vào để chỉ rải marker những cái được chọn */}
          <TravelMap
            locations={selectedLocations} 
            itinerary={selectedLocations}
            onLocationSelect={(loc) => console.log('Selected:', loc)}
          />

          {/* HIỂN THỊ THỜI TIẾT NỔI LÊN TRÊN MAP */}
          {selectedCity && (
            <div className="absolute top-4 left-13 z-1000 pointer-events-none">
              <div className="pointer-events-auto">
                <WeatherDisplay city={selectedCity} attractions={allResults} />
              </div>
            </div>
          )}
        </div>
        
      </main>
    </div>
  );
}

export default App;