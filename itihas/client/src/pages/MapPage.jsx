import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FaFilter, FaStar } from 'react-icons/fa';
import { placesAPI } from '../services/api';

const CATEGORIES = ['All', 'Archaeological', 'Architectural', 'Religious', 'Natural', 'Liberation War', 'Cultural', 'UNESCO'];

const CATEGORY_COLORS = {
  Archaeological: '#92400e',
  Architectural: '#1a5632',
  Religious: '#7c3aed',
  Natural: '#0d9488',
  'Liberation War': '#dc2626',
  Cultural: '#ea580c',
  UNESCO: '#1d4ed8',
};

function createMarkerIcon(category) {
  const color = CATEGORY_COLORS[category] || '#c5972c';
  return L.divIcon({
    className: '',
    html: `<div style="background-color:${color};width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function MapPage() {
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    placesAPI.getMapAll()
      .then(({ data }) => {
        const items = data?.data || [];
        setPlaces(items);
        setFiltered(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryFilter = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      setFiltered(places);
    } else {
      setFiltered(places.filter((p) => p.category === cat));
    }
  };

  const validPlaces = filtered.filter(
    (p) => Array.isArray(p.location?.coordinates) && p.location.coordinates.length === 2
  );

  return (
    <>
      <Helmet>
        <title>Heritage Map – ইতিহাস</title>
      </Helmet>

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-heritage-cream flex flex-col z-10`}>
          <div className="p-4 border-b border-heritage-cream">
            <h2 className="font-heading font-semibold text-heritage-dark">Filter by Category</h2>
            <p className="text-xs text-heritage-dark/50 mt-1">{validPlaces.length} sites shown</p>
          </div>
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All' ? places.length : places.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryFilter(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeCategory === cat
                      ? 'bg-heritage-green text-white'
                      : 'hover:bg-heritage-cream text-heritage-dark'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {cat !== 'All' && (
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] || '#ccc' }}
                      />
                    )}
                    {cat}
                  </span>
                  <span className={`text-xs ${activeCategory === cat ? 'text-white/70' : 'text-heritage-dark/40'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-heritage-cream">
            <p className="text-xs text-heritage-dark/50 font-medium uppercase tracking-wider mb-2">Legend</p>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-heritage-dark/60 truncate">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative">
          {/* Toggle sidebar button */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="absolute top-4 left-4 z-[1000] bg-white shadow-md rounded-lg p-2.5 hover:bg-heritage-cream transition-colors"
            title="Toggle filters"
          >
            <FaFilter size={14} className="text-heritage-dark" />
          </button>

          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-heritage-cream">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-heritage-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-heritage-dark/60">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[23.685, 90.356]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {validPlaces.map((place) => (
                <Marker
                  key={place._id}
                  position={[place.location.coordinates[1], place.location.coordinates[0]]}
                  icon={createMarkerIcon(place.category)}
                >
                  <Popup maxWidth={220}>
                    <div className="p-1">
                      {place.coverImage && (
                        <img
                          src={place.coverImage}
                          alt={place.name?.en}
                          className="w-full h-24 object-cover rounded mb-2"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <h3 className="font-semibold text-heritage-dark text-sm leading-tight">{place.name?.en}</h3>
                      <p className="text-xs text-heritage-dark/60 mt-0.5">{place.category}</p>
                      {place.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <FaStar size={10} className="text-heritage-gold" />
                          <span className="text-xs">{place.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                      <Link
                        to={`/places/${place.slug}`}
                        className="inline-block mt-2 text-xs text-heritage-green font-medium hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </>
  );
}
