import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { reviewsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ReviewForm({ placeId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!text.trim()) { toast.error('Please write your review'); return; }
    setLoading(true);
    try {
      await reviewsAPI.create(placeId, { rating, title, text });
      toast.success('Review submitted!');
      setRating(0); setTitle(''); setText('');
      onReviewSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-heritage-cream/50 rounded-xl p-5 border border-heritage-cream">
      <h3 className="font-heading font-semibold text-heritage-dark mb-4">Write a Review</h3>

      {/* Star picker */}
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <FaStar
              size={24}
              className={(hovered || rating) >= star ? 'text-heritage-gold' : 'text-heritage-dark/20'}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-heritage-dark/60 self-center">
          {rating > 0 ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] : 'Select rating'}
        </span>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="w-full px-3 py-2.5 text-sm border border-heritage-cream rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-heritage-green/30 bg-white"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your experience..."
        rows={4}
        required
        className="w-full px-3 py-2.5 text-sm border border-heritage-cream rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-heritage-green/30 bg-white resize-none"
      />
      <button type="submit" disabled={loading} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-60">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
