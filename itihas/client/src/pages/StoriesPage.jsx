import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FaHeart, FaPlus, FaTimes } from 'react-icons/fa';
import { storiesAPI, placesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StoryForm({ onSubmit, onClose, places }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await storiesAPI.create({ title, content, place: placeId || undefined });
      toast.success('Story submitted for review!');
      onSubmit?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-heritage-cream">
          <h2 className="font-heading font-semibold text-heritage-dark text-xl">Share Your Story</h2>
          <button onClick={onClose} className="p-2 hover:bg-heritage-cream rounded-lg transition-colors">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-heritage-dark mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story a title..."
              required
              className="w-full px-3 py-2.5 text-sm border border-heritage-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-green/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heritage-dark mb-1">Related Place (optional)</label>
            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-heritage-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-green/30"
            >
              <option value="">Select a place...</option>
              {places.map((p) => <option key={p._id} value={p._id}>{p.name?.en}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-heritage-dark mb-1">Your Story *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience, memories, or discoveries..."
              rows={6}
              required
              className="w-full px-3 py-2.5 text-sm border border-heritage-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-green/30 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Story'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm border border-heritage-cream rounded-lg hover:bg-heritage-cream transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function StoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [likedIds, setLikedIds] = useState(new Set());

  const loadStories = () => {
    storiesAPI.getAll({ approved: true })
      .then(({ data }) => setStories(data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStories();
    placesAPI.getAll({ limit: 100 }).then(({ data }) => setPlaces(data?.data || [])).catch(() => {});
  }, []);

  const handleLike = async (id) => {
    if (!user) { toast.error('Login to like stories'); return; }
    if (likedIds.has(id)) return;
    // Optimistic update
    setLikedIds((s) => new Set([...s, id]));
    setStories((prev) => prev.map((s) => s._id === id ? { ...s, likes: (s.likes || 0) + 1 } : s));
    try {
      await storiesAPI.like(id);
    } catch {
      // Rollback on error
      setLikedIds((s) => { const next = new Set(s); next.delete(id); return next; });
      setStories((prev) => prev.map((s) => s._id === id ? { ...s, likes: Math.max(0, (s.likes || 1) - 1) } : s));
      toast.error('Could not like story');
    }
  };

  return (
    <>
      <Helmet>
        <title>Community Stories – ইতিহাস</title>
      </Helmet>

      {showForm && (
        <StoryForm
          places={places}
          onSubmit={loadStories}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="min-h-screen bg-heritage-cream">
        {/* Header */}
        <div className="bg-heritage-green text-white py-12 px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-heading font-bold">Community Stories</h1>
              <p className="text-white/70 mt-1">Personal experiences and discoveries from fellow explorers</p>
            </div>
            {user && (
              <button onClick={() => setShowForm(true)} className="btn-gold gap-2 shrink-0">
                <FaPlus size={12} /> Share a Story
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {!user && (
            <div className="bg-white rounded-xl p-5 border border-heritage-cream mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-heritage-dark/70">Have a heritage story to share? Join our community!</p>
              <Link to="/register" className="btn-primary text-sm py-2 px-5 shrink-0">Join Now</Link>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-5 bg-heritage-cream rounded w-2/3 mb-3" />
                  <div className="h-3 bg-heritage-cream rounded w-full mb-2" />
                  <div className="h-3 bg-heritage-cream rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-heritage-dark/40 text-lg mb-4">No stories yet.</p>
              {user && (
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                  Be the first to share
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {stories.map((story, i) => (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-6 border border-heritage-cream hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-heritage-dark text-lg leading-snug">{story.title}</h3>
                      {story.place?.name?.en && (
                        <Link
                          to={`/places/${story.place.slug}`}
                          className="text-xs text-heritage-green hover:underline mt-1 inline-block"
                        >
                          📍 {story.place.name.en}
                        </Link>
                      )}
                      <p className="text-sm text-heritage-dark/70 mt-3 leading-relaxed line-clamp-4">{story.content}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-heritage-dark/40">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-heritage-green/20 text-heritage-green rounded-full flex items-center justify-center text-xs font-bold">
                          {story.author?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span>{story.author?.name || 'Anonymous'}</span>
                      </div>
                      {story.createdAt && <span>• {format(new Date(story.createdAt), 'MMM d, yyyy')}</span>}
                    </div>
                    <button
                      onClick={() => handleLike(story._id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                        likedIds.has(story._id)
                          ? 'bg-red-50 text-red-500'
                          : 'bg-heritage-cream text-heritage-dark/50 hover:text-red-500'
                      }`}
                    >
                      <FaHeart size={11} /> {story.likes || 0}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
