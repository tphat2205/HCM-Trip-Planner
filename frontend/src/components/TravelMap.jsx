import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Navigation, Maximize2, Minimize2, Route, Wallet, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import BudgetSummary from './BudgetSummary';


// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Ho Chi Minh City bounds and center
const HCM_CENTER = [10.7769, 106.7009];
const HCM_BOUNDS = [
  [10.65, 106.35], // Southwest
  [11.15, 106.95], // Northeast
];

// Approximate coordinates for HCM districts
const DISTRICT_COORDS = {
  'Quận 1': [10.7769, 106.7009],
  'Quận 2': [10.7868, 106.7516],
  'Quận 3': [10.7834, 106.6856],
  'Quận 4': [10.7578, 106.7013],
  'Quận 5': [10.7540, 106.6633],
  'Quận 6': [10.7480, 106.6352],
  'Quận 7': [10.7340, 106.7220],
  'Quận 8': [10.7240, 106.6284],
  'Quận 9': [10.8490, 106.8240],
  'Quận 10': [10.7745, 106.6680],
  'Quận 11': [10.7620, 106.6500],
  'Quận 12': [10.8671, 106.6413],
  'Bình Thạnh': [10.8105, 106.7091],
  'Bình Tân': [10.7652, 106.6038],
  'Gò Vấp': [10.8386, 106.6652],
  'Phú Nhuận': [10.7996, 106.6825],
  'Tân Bình': [10.8014, 106.6528],
  'Tân Phú': [10.7900, 106.6280],
  'Thủ Đức': [10.8514, 106.7534],
  'Thành phố Thủ Đức': [10.8514, 106.7534],
};

// Get coordinates from district name in address
function getCoordinatesFromAddress(address, district) {
  // First try district from location data
  if (district && DISTRICT_COORDS[district]) {
    // Add small random offset to prevent markers stacking
    const offset = () => (Math.random() - 0.5) * 0.01;
    return [
      DISTRICT_COORDS[district][0] + offset(),
      DISTRICT_COORDS[district][1] + offset(),
    ];
  }
  
  // Try to find district from address string
  if (address) {
    for (const [districtName, coords] of Object.entries(DISTRICT_COORDS)) {
      if (address.includes(districtName)) {
        const offset = () => (Math.random() - 0.5) * 0.01;
        return [coords[0] + offset(), coords[1] + offset()];
      }
    }
  }
  
  // Default to HCM center with random offset
  const offset = () => (Math.random() - 0.5) * 0.02;
  return [HCM_CENTER[0] + offset(), HCM_CENTER[1] + offset()];
}

// Normalize category for display
function normalizeCategory(category) {
  if (!category) return 'Attraction';
  const cat = category.toLowerCase();
  if (cat.includes('hotel')) return 'Hotel';
  if (cat.includes('dining') || cat.includes('restaurant')) return 'Restaurant';
  return 'Attraction';
}

// Custom marker icons by category
const createCustomIcon = (category) => {
  const normalizedCat = normalizeCategory(category);
  const colors = {
    Hotel: '#3B82F6',      // blue
    Restaurant: '#F97316', // orange
    Attraction: '#8B5CF6', // purple
  };
  
  const color = colors[normalizedCat] || '#10B981';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${normalizedCat[0]}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to fit bounds when locations change
function FitBounds({ locations }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const validLocations = locations.filter(loc => loc.lat && loc.lng);
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(
          validLocations.map(loc => [loc.lat, loc.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [locations, map]);
  
  return null;
}

// Component to restrict map to HCM bounds
function RestrictBounds() {
  const map = useMap();
  
  useEffect(() => {
    map.setMaxBounds(HCM_BOUNDS);
    map.setMinZoom(11);
    map.setMaxZoom(18);
  }, [map]);
  
  return null;
}

// Component to draw route between locations
function RouteLayer({ locations, showRoute }) {
  const map = useMap();
  const routeLayerRef = useRef(null);
  
  useEffect(() => {
    // Remove existing route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    
    const validLocations = locations.filter(loc => loc.lat && loc.lng);
    if (!showRoute || validLocations.length < 2) return;
    
    // Create route polyline
    const routeCoords = validLocations.map(loc => [loc.lat, loc.lng]);
    
    // Draw a curved path between points
    const polyline = L.polyline(routeCoords, {
      color: '#10B981',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10',
      lineJoin: 'round',
    });
    
    polyline.addTo(map);
    routeLayerRef.current = polyline;
    
    // Animate the dash
    let offset = 0;
    const animateDash = () => {
      offset = (offset + 1) % 20;
      polyline.setStyle({ dashOffset: offset });
    };
    const intervalId = setInterval(animateDash, 50);
    
    return () => {
      clearInterval(intervalId);
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
      }
    };
  }, [locations, showRoute, map]);
  
  return null;
}

export default function TravelMap({ locations, itinerary = [], selectedLocation, onLocationSelect }) {
  const [showRoute, setShowRoute] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  // Process locations to add coordinates
  const processedLocations = locations.map((loc, index) => {
    // Priority 1: Use exact coordinates from backend (geocoding)
    if (loc.latitude && loc.longitude) {
      return { ...loc, lat: loc.latitude, lng: loc.longitude };
    }
    // Priority 2: If already has lat/lng (e.g. from previous processing)
    if (loc.lat && loc.lng) {
      return loc;
    }
    
    // Fallback: Generate approximate coordinates from address/district
    const [lat, lng] = getCoordinatesFromAddress(loc.address, loc.district);
    return { ...loc, lat, lng };
  });

  // if (locations.length === 0) {
  //   return (
  //     <motion.div
  //       className={`relative rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 h-full`}
  //       layout
  //     >
  //       <div className="absolute inset-0 flex items-center justify-center">
  //         <div className="text-center text-gray-500 dark:text-gray-400">
  //           <Navigation className="h-12 w-12 mx-auto mb-3 opacity-50" />
  //           <p>Thêm địa điểm vào hành trình để xem bản đồ</p>
  //         </div>
  //       </div>
  //     </motion.div>
  //   );
  // }

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden shadow-lg h-full"
      layout
      transition={{ duration: 0.3 }}
    >
      <MapContainer
        center={HCM_CENTER}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RestrictBounds />
        <FitBounds locations={processedLocations} />
        <RouteLayer locations={processedLocations} showRoute={showRoute} />
        
        {processedLocations.map((location, index) => (
          location.lat && location.lng && (
            <Marker
              key={location.id || index}
              position={[location.lat, location.lng]}
              icon={createCustomIcon(location.category)}
              eventHandlers={{
                click: () => onLocationSelect?.(location),
              }}
            >
              <Popup>
                <div className="min-w-50">
                  <h3 className="font-bold text-gray-800 mb-1">{location.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{location.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 font-semibold">
                      {location.price_min === 0 ? 'Miễn phí' : `${(location.price_min / 1000).toFixed(0)}K VNĐ`}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                      Điểm {index + 1}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-1000">
        <motion.button
          onClick={() => setShowRoute(!showRoute)}
          className={`p-2 rounded-lg shadow-md hover:shadow-lg transition-all ${
            showRoute
              ? 'bg-emerald-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={showRoute ? 'Ẩn lộ trình' : 'Hiện lộ trình'}
        >
          <Route className="h-5 w-5" />
        </motion.button>

        <motion.button
          onClick={() => setShowBudget(true)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all text-gray-600 dark:text-gray-300 hover:text-emerald-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Ước tính ngân sách"
        >
          <Wallet className="h-5 w-5" />
        </motion.button>

      </div>
      <AnimatePresence>
        {showBudget && (
          <motion.div
            className="absolute inset-0 z-2000 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative w-full max-w-md">
              {/* Nút đóng popup */}
              <button 
                onClick={() => setShowBudget(false)}
                className="absolute -top-3 -right-3 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* Hiển thị BudgetSummary bên trong */}
              <div className="max-h-[80vh] overflow-y-auto rounded-2xl no-scrollbar">
                <BudgetSummary itinerary={itinerary.length > 0 ? itinerary : locations} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Map Title */}
      {/* <div className="absolute top-4 left-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-1.5 z-1000">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          TP. Hồ Chí Minh
        </span>
      </div> */}
      
      {/* Route Info */}
      {showRoute && processedLocations.length > 1 && (
        <motion.div
          className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-md px-4 py-2 z-1000"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-sm">
            <Route className="h-4 w-4 text-emerald-500" />
            <span className="text-gray-600 dark:text-gray-300">
              Lộ trình: {processedLocations.length} điểm
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
