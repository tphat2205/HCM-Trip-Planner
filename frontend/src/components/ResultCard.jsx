import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Banknote,
  Plus,
  Check,
  Hotel,
  UtensilsCrossed,
  Camera,
  Clock,
  ExternalLink,
} from "lucide-react";

// Normalize category for display
function normalizeCategory(category) {
  if (!category) return "Attraction";
  const cat = category.toLowerCase();
  if (cat.includes("hotel")) return "Hotel";
  if (cat.includes("dining") || cat.includes("restaurant")) return "Dining";
  return "Attraction";
}

const categoryIcons = {
  Hotel: Hotel,
  Dining: UtensilsCrossed,
  Attraction: Camera,
};

// --- Redesigned category theme system ---
const categoryTheme = {
  Hotel: {
    badge: "bg-gradient-to-r from-sky-500 to-cyan-400",
    glow: "hover:shadow-sky-500/20 dark:hover:shadow-sky-400/15",
    borderAccent: "hover:border-sky-400/50 dark:hover:border-sky-500/40",
    topBar: "from-sky-500/80 to-cyan-400/60",
  },
  Dining: {
    badge: "bg-gradient-to-r from-amber-500 to-orange-400",
    glow: "hover:shadow-amber-500/20 dark:hover:shadow-amber-400/15",
    borderAccent: "hover:border-amber-400/50 dark:hover:border-amber-500/40",
    topBar: "from-amber-500/80 to-orange-400/60",
  },
  Attraction: {
    badge: "bg-gradient-to-r from-emerald-500 to-teal-400",
    glow: "hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/15",
    borderAccent:
      "hover:border-emerald-400/50 dark:hover:border-emerald-500/40",
    topBar: "from-emerald-500/80 to-teal-400/60",
  },
};

const categoryLabels = {
  Hotel: "Khách sạn",
  Dining: "Quán ăn",
  Attraction: "Địa điểm",
};

function formatPrice(price) {
  if (!price || price === 0) return "Miễn phí";
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  return `${(price / 1000).toFixed(0)}K`;
}

// Generate placeholder image based on category
function getPlaceholderImage(category) {
  const normalizedCat = normalizeCategory(category);
  const images = {
    Hotel:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    Dining:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    Attraction:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop",
  };
  return images[normalizedCat] || images.Attraction;
}

export default function ResultCard({ location, onAddToTrip, isInTrip, index }) {
  const normalizedCategory = normalizeCategory(location.category);
  const CategoryIcon = categoryIcons[normalizedCategory] || Camera;
  const theme = categoryTheme[normalizedCategory] || categoryTheme.Attraction;
  const categoryLabel = categoryLabels[normalizedCategory] || location.category;

  // Get image URL or placeholder
  const imageUrl =
    location.image_url || location.url?.includes("unsplash")
      ? location.image_url
      : getPlaceholderImage(location.category);

  return (
    <motion.div
      className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg shadow-gray-300/40 dark:shadow-black/40 ${theme.glow} hover:shadow-2xl border border-gray-200/80 dark:border-gray-700/60 ${theme.borderAccent} flex flex-col h-full group transition-all duration-300`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      layout
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-linear-to-r ${theme.topBar}`} />

      {/* Image */}
      <div className="relative h-36 sm:h-40 lg:h-44 overflow-hidden">
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
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

        {/* Category Badge */}
        <div
          className={`absolute top-3 left-3 ${theme.badge} text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg`}
        >
          <CategoryIcon className="h-3.5 w-3.5" />
          {categoryLabel}
        </div>

        {/* Score Badge */}
        {location.score > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-gray-800 dark:text-white">
              {typeof location.score === "number"
                ? location.score.toFixed(1)
                : location.score}
            </span>
          </div>
        )}

        {/* District Badge */}
        {location.district && location.district !== "Unknown" && (
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
            <MapPin className="h-3 w-3 text-emerald-500" />
            {location.district}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-1.5 sm:mb-2 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {location.name}
        </h3>

        <div className="flex items-start gap-1.5 sm:gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1.5 sm:mb-2">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{location.address}</span>
        </div>

        {/* Operating Hours */}
        {(location.start_time || location.end_time) &&
          location.start_time !== "-" &&
          location.end_time !== "-" && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1.5 sm:mb-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {location.start_time} - {location.end_time}
              </span>
            </div>
          )}

        {/* Reason (from Model ML)
        {location.reason && (
          <p className="text-emerald-600 dark:text-emerald-400 text-xs mb-3 italic">
            💡 {location.reason}
          </p>
        )} */}

        <div className="flex-1" />

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Banknote className="h-4 w-4" />
            <span className="font-bold text-xs sm:text-sm">
              {formatPrice(location.price_min)}
            </span>
            {location.price_max > location.price_min && (
              <span className="text-gray-400 dark:text-gray-500 text-xs">
                - {formatPrice(location.price_max)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* External Link */}
            {location.url && (
              <motion.a
                href={location.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700/80 text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </motion.a>
            )}

            <motion.button
              onClick={() => onAddToTrip(location)}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                isInTrip
                  ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700"
                  : "bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/25"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isInTrip ? (
                <>
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Đã thêm</span>
                  <span className="sm:hidden">✓</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Thêm vào</span>
                  <span className="sm:hidden">+</span>
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
      className="bg-white/90 dark:bg-gray-800/90 rounded-xl overflow-hidden shadow-lg border border-gray-200/80 dark:border-gray-700/60"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="h-1 w-full bg-linear-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 animate-pulse" />
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
