import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet, Hotel, UtensilsCrossed, Camera, TrendingUp } from 'lucide-react';

const COLORS = ['#3B82F6', '#F97316', '#8B5CF6'];

function formatCurrency(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M VND`;
  }
  return `${(value / 1000).toFixed(0)}K VND`;
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-800 dark:text-white">
          {payload[0].name}
        </p>
        <p className="text-sm text-emerald-600 font-semibold">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function BudgetSummary({ itinerary }) {
  // Normalize category for comparison
  const normalizeCategory = (category) => {
    if (!category) return '';
    const cat = category.toLowerCase();
    if (cat.includes('hotel')) return 'Hotel';
    if (cat.includes('dining') || cat.includes('restaurant')) return 'Restaurant';
    if (cat.includes('attraction')) return 'Attraction';
    return category;
  };

  // Calculate budget breakdown
  const hotelCost = itinerary
    .filter(item => normalizeCategory(item.category) === 'Hotel')
    .reduce((sum, item) => sum + (item.price_min || 0), 0);
  
  const diningCost = itinerary
    .filter(item => normalizeCategory(item.category) === 'Restaurant')
    .reduce((sum, item) => sum + (item.price_min || 0), 0);
  
  const attractionCost = itinerary
    .filter(item => normalizeCategory(item.category) === 'Attraction')
    .reduce((sum, item) => sum + (item.price_min || 0), 0);
  
  const totalCost = hotelCost + diningCost + attractionCost;
  
  const chartData = [
    { name: 'Khách sạn', value: hotelCost, icon: Hotel },
    { name: 'Ăn uống', value: diningCost, icon: UtensilsCrossed },
    { name: 'Tham quan', value: attractionCost, icon: Camera },
  ].filter(item => item.value > 0);

  if (itinerary.length === 0) {
    return (
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-xl">
            <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Ước tính ngân sách
          </h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Thêm địa điểm vào hành trình để xem ước tính chi phí
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-xl">
            <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Ước tính ngân sách
          </h3>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">{itinerary.length} địa điểm</span>
        </div>
      </div>

      {/* Total Budget */}
      <motion.div
        className="text-center mb-6 p-4 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng chi phí dự kiến</p>
        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(totalCost)}
        </p>
      </motion.div>

      {/* Pie Chart */}
      {chartData.length > 0 && (
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-3">
        {[
          { label: 'Khách sạn', value: hotelCost, color: 'bg-blue-500', Icon: Hotel },
          { label: 'Ăn uống', value: diningCost, color: 'bg-orange-500', Icon: UtensilsCrossed },
          { label: 'Tham quan', value: attractionCost, color: 'bg-purple-500', Icon: Camera },
        ].map(({ label, value, color, Icon }) => (
          <motion.div
            key={label}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 ${color} rounded-lg`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-white">
              {formatCurrency(value)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        * Giá ước tính dựa trên mức giá thấp nhất
      </p>
    </motion.div>
  );
}
