import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import {
  FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaCalendarAlt,
  FaHeart, FaBookmark, FaShare, FaArrowLeft,
} from 'react-icons/fa';
import { placesAPI, reviewsAPI, storiesAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/places/StarRating';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewForm from '../components/reviews/ReviewForm';
import toast from 'react-hot-toast';

// Fix leaflet default icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const TABS = ['Story', 'Info', 'Reviews', 'Stories'];

const CATEGORY_COLORS = {
  Archaeological: 'bg-amber-100 text-amber-800',
  Architectural: 'bg-green-100 text-green-800',
  Religious: 'bg-purple-100 text-purple-800',
  Natural: 'bg-teal-100 text-teal-800',
  'Liberation War': 'bg-red-100 text-red-800',
  Cultural: 'bg-orange-100 text-orange-800',
  UNESCO: 'bg-blue-100 text-blue-800',
};

export default function PlaceDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Story');
  const [reviews, setReviews] = useState([]);
  const [stories, setStories] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setLoading(true);
    placesAPI.getBySlug(slug)
      .then(({ data }) => {
        const p = data?.data || data;
        setPlace(p);
        // Load reviews
        reviewsAPI.getAll({ place: p._id }).then(({ data: rd }) => setReviews(rd?.data || [])).catch(() => {});
        // Load stories
        storiesAPI.getAll({ place: p._id }).then(({ data: sd }) => setStories(sd?.data || [])).catch(() => {});
      })
      .catch(() => toast.error('Place not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBookmark = async () => {
    if (!user) { toast.error('Login to bookmark places'); return; }
    try {
      await authAPI.toggleBookmark(place._id);
      setBookmarked((b) => !b);
      toast.success(bookmarked ? 'Removed from bookmarks' : 'Bookmarked!');
    } catch { toast.error('Could not update bookmark'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-heritage-cream">
        <div className="h-72 bg-heritage-cream animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 bg-white rounded animate-pulse w-2/3" />
          <div className="h-4 bg-white rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-heading text-heritage-dark mb-4">Place not found</h2>
        <Link to="/places" className="btn-primary">Back to Places</Link>
      </div>
    );
  }

  const coords = place.location?.coordinates;
  const hasMap = coords?.lat != null && coords?.lng != null;

  return (
    <>
      <Helmet>
        <title>{place.name?.en} – ইতিহাস</title>
        <meta name="description" content={place.description?.short} />
      </Helmet>

      {/* Hero */}
      <div className="relative h-72 md:h-96 bg-heritage-dark overflow-hidden">
        {place.coverImage && (
          <img
            src={place.coverImage}
            alt={place.name?.en}
            className="w-full h-full object-cover opacity-70"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-dark via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-5xl mx-auto">
          <Link to="/places" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <FaArrowLeft size={12} /> Back to Places
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[place.category] || 'bg-gray-100 text-gray-700'}`}>
              {place.category}
            </span>
            {place.era?.map((e) => (
              <span key={e} className="text-xs px-2.5 py-1 rounded-full bg-heritage-gold/20 text-heritage-gold border border-heritage-gold/30">{e}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white">{place.name?.en}</h1>
          {place.name?.bn && <p className="text-xl font-bengali text-heritage-gold mt-1">{place.name.bn}</p>}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={handleBookmark} className={`p-2.5 rounded-full backdrop-blur-sm transition-colors ${bookmarked ? 'bg-heritage-gold text-white' : 'bg-black/30 text-white hover:bg-heritage-gold'}`}>
            <FaBookmark size={14} />
          </button>
          <button
            onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
            className="p-2.5 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-colors"
          >
            <FaShare size={14} />
          </button>
        </div>
      </div>

      {/* Meta bar */}
      <div className="bg-white border-b border-heritage-cream sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center text-sm text-heritage-dark/60">
            {place.location && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-heritage-green" />
                {[place.location.district, place.location.division].filter(Boolean).join(', ')}
              </span>
            )}
            {place.averageRating > 0 && (
              <span className="flex items-center gap-2">
                <StarRating rating={place.averageRating} size={13} />
                <span className="text-xs">{place.averageRating.toFixed(1)} ({place.totalReviews})</span>
              </span>
            )}
          </div>
          {place.heritageScore && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-heritage-dark/50">Heritage Score</span>
              <span className="bg-heritage-gold text-white font-bold px-2 py-0.5 rounded-full">{place.heritageScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {place.subtitle && (
          <p className="text-lg text-heritage-dark/70 italic mb-6">{place.subtitle}</p>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-heritage-cream mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-heritage-green text-heritage-green'
                  : 'border-transparent text-heritage-dark/60 hover:text-heritage-dark'
              }`}
            >
              {tab}
              {tab === 'Reviews' && reviews.length > 0 && (
                <span className="ml-1.5 bg-heritage-cream text-heritage-dark/60 text-xs px-1.5 py-0.5 rounded-full">{reviews.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Story tab */}
        {activeTab === 'Story' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            {place.story?.length > 0 ? (
              place.story.map((chapter, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-heritage-green text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      {chapter.chapter || i + 1}
                    </div>
                    {i < place.story.length - 1 && <div className="flex-1 w-px bg-heritage-cream mt-2" />}
                  </div>
                  <div className="flex-1 pb-8">
                    {chapter.year && (
                      <span className="text-xs font-medium text-heritage-gold uppercase tracking-wider">{chapter.year} • {chapter.era}</span>
                    )}
                    <h3 className="text-xl font-heading font-semibold text-heritage-dark mt-1 mb-3">
                      {chapter.title}
                    </h3>
                    <div
                      className="prose prose-sm max-w-none text-heritage-dark/80 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chapter.content || '') }}
                    />
                    {chapter.image && (
                      <img src={chapter.image} alt={chapter.title} className="mt-4 rounded-xl w-full max-h-72 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-heritage-dark/50 italic">{place.description?.full || place.description?.short || 'No story content available.'}</p>
            )}
          </motion.div>
        )}

        {/* Info tab */}
        {activeTab === 'Info' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Description */}
            {place.description?.full && (
              <div>
                <h2 className="text-xl font-heading font-semibold mb-3">About</h2>
                <p className="text-heritage-dark/70 leading-relaxed">{place.description.full}</p>
              </div>
            )}

            {/* Facts */}
            {place.facts?.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4">Key Facts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {place.facts.map((fact, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-heritage-cream">
                      <h4 className="font-semibold text-heritage-green text-sm mb-1">{fact.title}</h4>
                      <p className="text-sm text-heritage-dark/70">{fact.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {place.timeline?.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4">Timeline</h2>
                <div className="space-y-3">
                  {place.timeline.map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="text-sm font-bold text-heritage-gold shrink-0 w-16">{item.year}</span>
                      <p className="text-sm text-heritage-dark/70 leading-relaxed">{item.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practical Info */}
            {place.practicalInfo && (
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4">Visitor Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {place.practicalInfo.openingHours && (
                    <div className="flex gap-3 items-start bg-white p-4 rounded-xl border border-heritage-cream">
                      <FaClock className="text-heritage-green mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-heritage-dark/50 uppercase">Opening Hours</p>
                        <p className="text-sm text-heritage-dark mt-0.5">{place.practicalInfo.openingHours}</p>
                      </div>
                    </div>
                  )}
                  {place.practicalInfo.entryFee && (
                    <div className="flex gap-3 items-start bg-white p-4 rounded-xl border border-heritage-cream">
                      <FaMoneyBillWave className="text-heritage-green mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-heritage-dark/50 uppercase">Entry Fee</p>
                        <p className="text-sm text-heritage-dark mt-0.5">
                          Local: {place.practicalInfo.entryFee.local || 'Free'} | Foreign: {place.practicalInfo.entryFee.foreign || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                  {place.practicalInfo.bestTimeToVisit && (
                    <div className="flex gap-3 items-start bg-white p-4 rounded-xl border border-heritage-cream">
                      <FaCalendarAlt className="text-heritage-green mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-heritage-dark/50 uppercase">Best Time to Visit</p>
                        <p className="text-sm text-heritage-dark mt-0.5">{place.practicalInfo.bestTimeToVisit}</p>
                      </div>
                    </div>
                  )}
                  {place.practicalInfo.howToReach && (
                    <div className="flex gap-3 items-start bg-white p-4 rounded-xl border border-heritage-cream">
                      <FaMapMarkerAlt className="text-heritage-green mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-heritage-dark/50 uppercase">How to Reach</p>
                        <p className="text-sm text-heritage-dark mt-0.5">{place.practicalInfo.howToReach}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {hasMap && (
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4">Location</h2>
                <div className="rounded-xl overflow-hidden border border-heritage-cream h-64">
                  <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[coords.lat, coords.lng]} icon={defaultIcon}>
                      <Popup>
                        <strong>{place.name?.en}</strong>
                        {place.location?.address && <><br />{place.location.address}</>}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Reviews tab */}
        {activeTab === 'Reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {user ? (
              <ReviewForm placeId={place._id} onReviewSubmitted={() => {
                reviewsAPI.getAll({ place: place._id }).then(({ data }) => setReviews(data?.data || [])).catch(() => {});
              }} />
            ) : (
              <div className="bg-heritage-cream/50 rounded-xl p-5 text-center">
                <p className="text-sm text-heritage-dark/60 mb-3">Login to share your experience</p>
                <Link to="/login" className="btn-primary text-sm py-2 px-5">Login</Link>
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="text-heritage-dark/40 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Stories tab */}
        {activeTab === 'Stories' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {stories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-heritage-dark/40 mb-4">No community stories yet.</p>
                {user && <Link to="/stories" className="btn-primary text-sm">Share a Story</Link>}
              </div>
            ) : (
              stories.map((story) => (
                <div key={story._id} className="bg-white rounded-xl p-5 border border-heritage-cream">
                  <h3 className="font-heading font-semibold text-heritage-dark mb-2">{story.title}</h3>
                  <p className="text-sm text-heritage-dark/70 line-clamp-3">{story.content}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-heritage-dark/40">
                    <span>By {story.author?.name || 'Anonymous'}</span>
                    <span>• {story.likes || 0} likes</span>
                    {story.createdAt && <span>• {format(new Date(story.createdAt), 'MMM d, yyyy')}</span>}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
