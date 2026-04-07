import { motion } from 'framer-motion';
import { MapPin, Star, Banknote, Plus, Check, Hotel, UtensilsCrossed, Camera, Clock, ExternalLink } from 'lucide-react';

// Normalize category for display
function normalizeCategory(category) {
  if (!category) return 'Attraction';
  const cat = category.toLowerCase();
  if (cat.includes('hotel')) return 'Hotel';
  if (cat.includes('dining') || cat.includes('restaurant')) return 'Restaurant';
  return 'Attraction';
}

const categoryIcons = {
  Hotel: Hotel,
  Restaurant: UtensilsCrossed,
  Attraction: Camera,
};

const categoryColors = {
  Hotel: 'bg-blue-500',
  Restaurant: 'bg-orange-500',
  Attraction: 'bg-purple-500',
};

const categoryLabels = {
  Hotel: 'Khách sạn',
  Restaurant: 'Nhà hàng',
  Attraction: 'Địa điểm',
};

function formatPrice(price) {
  if (!price || price === 0) return 'Miễn phí';
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  return `${(price / 1000).toFixed(0)}K`;
}

// Generate placeholder image based on category
function getPlaceholderImage(category) {
  const normalizedCat = normalizeCategory(category);
  const images = {
    Hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    Restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    Attraction: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop',
  };
  return images[normalizedCat] || images.Attraction;
}

export default function ResultCard({ location, onAddToTrip, isInTrip, index }) {
  const normalizedCategory = normalizeCategory(location.category);
  const CategoryIcon = categoryIcons[normalizedCategory] || Camera;
  const categoryColor = categoryColors[normalizedCategory] || 'bg-gray-500';
  const categoryLabel = categoryLabels[normalizedCategory] || location.category;
  
  // Get image URL or placeholder
  const imageUrl = location.image_url || location.url?.includes('unsplash') 
    ? location.image_url 
    : getPlaceholderImage(location.category);

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      layout
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={location.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
          onError={(e) => {
            e.target.src = getPlaceholderImage(location.category);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Category Badge */}
        <div className={`absolute top-3 left-3 ${categoryColor} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
          <CategoryIcon className="h-3 w-3" />
          {categoryLabel}
        </div>
        
        {/* Score Badge */}
        {location.score > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              {typeof location.score === 'number' ? location.score.toFixed(1) : location.score}
            </span>
          </div>
        )}
        
        {/* District Badge */}
        {location.district && location.district !== 'Unknown' && (
          <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location.district}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">
          {location.name}
        </h3>
        
        <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">{location.address}</span>
        </div>
        
        {/* Operating Hours */}
        {(location.start_time || location.end_time) && 
         location.start_time !== '-' && location.end_time !== '-' && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{location.start_time} - {location.end_time}</span>
          </div>
        )}
        
        {/* Reason (from AI) */}
        {location.reason && (
          <p className="text-emerald-600 dark:text-emerald-400 text-xs mb-3 italic">
            💡 {location.reason}
          </p>
        )}

        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Banknote className="h-4 w-4" />
            <span className="font-semibold">{formatPrice(location.price_min)}</span>
            {location.price_max > location.price_min && (
              <span className="text-gray-400 text-sm">- {formatPrice(location.price_max)}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* External Link */}
            {location.url && (
              <motion.a
                href={location.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-emerald-500"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </motion.a>
            )}
            
            <motion.button
              onClick={() => onAddToTrip(location)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                isInTrip
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-500 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isInTrip ? (
                <>
                  <Check className="h-4 w-4" />
                  Đã thêm
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Thêm vào
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton loading component
export function ResultCardSkeleton({ index }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse w-24" />
        </div>
      </div>
    </motion.div>
  );
}
