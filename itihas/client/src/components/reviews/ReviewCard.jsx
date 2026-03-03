import { useState } from 'react';
import { format } from 'date-fns';
import { FaThumbsUp } from 'react-icons/fa';
import StarRating from '../places/StarRating';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ReviewCard({ review, onHelpfulToggle }) {
  const { user } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [voted, setVoted] = useState(false);

  const handleHelpful = async () => {
    if (!user) { toast.error('Login to mark reviews as helpful'); return; }
    if (voted) return;
    try {
      await reviewsAPI.markHelpful(review._id);
      setHelpfulCount((c) => c + 1);
      setVoted(true);
      onHelpfulToggle?.();
    } catch {
      toast.error('Could not mark as helpful');
    }
  };

  const initials = review.user?.name
    ? review.user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="bg-white rounded-xl p-5 border border-heritage-cream">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-heritage-green text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-medium text-heritage-dark text-sm">{review.user?.name || 'Anonymous'}</span>
            <span className="text-xs text-heritage-dark/40">
              {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : ''}
            </span>
          </div>
          <StarRating rating={review.rating} size={12} />
          {review.title && (
            <h4 className="font-semibold text-heritage-dark mt-2 text-sm">{review.title}</h4>
          )}
          <p className="text-sm text-heritage-dark/70 mt-1 leading-relaxed">{review.text}</p>
          <button
            onClick={handleHelpful}
            className={`mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors ${
              voted ? 'text-heritage-green' : 'text-heritage-dark/40 hover:text-heritage-green'
            }`}
          >
            <FaThumbsUp size={11} />
            Helpful ({helpfulCount})
          </button>
        </div>
      </div>
    </div>
  );
}
