import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, MapPin, DollarSign, ChevronDown, X, Check } from 'lucide-react';
import { getDistricts } from '../api';

export default function FilterPanel({ onFiltersChange, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);

  // Fetch districts on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await getDistricts();
        setDistricts(data);
      } catch (error) {
        console.error('Failed to fetch districts:', error);
        // Fallback districts for HCM
        setDistricts([
          'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 
          'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh',
          'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú',
          'Thành phố Thủ Đức'
        ]);
      }
    };
    fetchDistricts();
  }, []);

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange({
      districts: selectedDistricts,
      minPrice: null,  // Always null - only use maxPrice
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    });
  }, [selectedDistricts, maxPrice]);

  const toggleDistrict = (district) => {
    setSelectedDistricts(prev => 
      prev.includes(district)
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const clearFilters = () => {
    setSelectedDistricts([]);
    setMaxPrice('');
  };

  const hasFilters = selectedDistricts.length > 0 || maxPrice;

  // Price presets (VND) - only max price
  const pricePresets = [
    { label: 'Dưới 100K', max: 100000 },
    { label: 'Dưới 500K', max: 500000 },
    { label: 'Dưới 1 triệu', max: 1000000 },
    { label: 'Dưới 2 triệu', max: 2000000 },
    { label: 'Dưới 5 triệu', max: 5000000 },
  ];

  const applyPricePreset = (preset) => {
    setMaxPrice(preset.max.toString());
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
          isOpen || hasFilters
            ? 'bg-emerald-500 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-500'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Filter className="h-4 w-4" />
        <span>Bộ lọc</span>
        {hasFilters && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {selectedDistricts.length + (maxPrice ? 1 : 0)}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Lọc kết quả
              </h3>
              {hasFilters && (
                <motion.button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="h-4 w-4" />
                  Xóa bộ lọc
                </motion.button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* District Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  Quận / Huyện
                </label>
                
                {/* District Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                    className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className={selectedDistricts.length > 0 ? 'text-gray-800 dark:text-white' : 'text-gray-400'}>
                        {selectedDistricts.length > 0 
                          ? `${selectedDistricts.length} quận được chọn`
                          : 'Chọn quận...'}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isDistrictDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isDistrictDropdownOpen && (
                      <motion.div
                        className="absolute z-50 w-full mt-2 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {districts.map((district) => (
                          <button
                            key={district}
                            onClick={() => toggleDistrict(district)}
                            className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              selectedDistricts.includes(district)
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span>{district}</span>
                            {selectedDistricts.includes(district) && (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected Districts Tags */}
                {selectedDistricts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedDistricts.map((district) => (
                      <motion.span
                        key={district}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        {district}
                        <button
                          onClick={() => toggleDistrict(district)}
                          className="hover:text-emerald-900 dark:hover:text-emerald-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget Filter - Only Max Budget */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Ngân sách tối đa (VNĐ)
                </label>

                {/* Budget Presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {pricePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyPricePreset(preset)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        maxPrice === preset.max.toString()
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-emerald-500'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Max Budget Input */}
                <div className="relative">
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Nhập ngân sách tối đa..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-800 dark:text-white placeholder-gray-400"
                  />
                  {maxPrice && (
                    <button
                      onClick={() => setMaxPrice('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Budget Display */}
                {maxPrice && (
                  <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    Ngân sách: tối đa {parseInt(maxPrice).toLocaleString()} VNĐ
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
