import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';

const CATEGORY_COLORS = {
  Archaeological: 'bg-amber-100 text-amber-800',
  Architectural: 'bg-green-100 text-green-800',
  Religious: 'bg-purple-100 text-purple-800',
  Natural: 'bg-teal-100 text-teal-800',
  'Liberation War': 'bg-red-100 text-red-800',
  Cultural: 'bg-orange-100 text-orange-800',
  UNESCO: 'bg-blue-100 text-blue-800',
};

export default function PlaceCard({ place }) {
  const { slug, name, coverImage, category, location, averageRating, heritageScore, subtitle } = place;
  const categoryClass = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
    >
      <Link to={`/places/${slug}`} className="block">
        <div className="relative h-48 bg-heritage-cream overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={name?.en || ''}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => { e.target.src = 'https://placehold.co/600x400/1a5632/f5f0e8?text=Heritage+Site'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-heritage-green/10">
              <span className="text-4xl font-bengali text-heritage-green/30">ইতিহাস</span>
            </div>
          )}
          {heritageScore != null && (
            <div className="absolute top-3 right-3 bg-heritage-gold text-white text-xs font-bold px-2 py-1 rounded-full">
              {heritageScore}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryClass}`}>
            {category}
          </span>
          {averageRating > 0 && (
            <span className="flex items-center gap-1 text-xs text-heritage-gold font-medium shrink-0">
              <FaStar size={11} />
              {averageRating.toFixed(1)}
            </span>
          )}
        </div>

        <Link to={`/places/${slug}`}>
          <h3 className="font-heading text-lg font-semibold text-heritage-dark hover:text-heritage-green transition-colors line-clamp-2 leading-snug">
            {name?.en || 'Heritage Site'}
          </h3>
        </Link>

        {subtitle && (
          <p className="mt-1 text-xs text-heritage-dark/60 line-clamp-2">{subtitle}</p>
        )}

        {location?.division && (
          <p className="mt-auto pt-3 flex items-center gap-1 text-xs text-heritage-dark/50">
            <FaMapMarkerAlt className="text-heritage-green shrink-0" />
            {location.district ? `${location.district}, ` : ''}{location.division}
          </p>
        )}
      </div>
    </motion.div>
  );
}
