import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({ rating = 0, max = 5, size = 14 }) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} size={size} className="text-heritage-gold" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} size={size} className="text-heritage-gold" />);
    } else {
      stars.push(<FaRegStar key={i} size={size} className="text-heritage-gold/40" />);
    }
  }
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {stars}
    </span>
  );
}
