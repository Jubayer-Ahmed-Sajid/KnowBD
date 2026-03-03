import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const categories = [
  'Archaeological', 'Architectural', 'Religious', 'Natural',
  'Liberation War', 'Cultural', 'UNESCO',
];

export default function Footer() {
  return (
    <footer className="bg-heritage-dark text-heritage-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex flex-col mb-4">
              <span className="text-3xl font-bengali font-bold text-heritage-gold">ইতিহাস</span>
              <span className="text-xs text-heritage-cream/50 tracking-widest uppercase">Heritage Explorer</span>
            </div>
            <p className="text-sm text-heritage-cream/70 leading-relaxed">
              Discover the rich cultural heritage of Bangladesh — from ancient archaeological
              ruins to vibrant folk traditions.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="text-heritage-cream/50 hover:text-heritage-gold transition-colors"><FaFacebook size={18} /></a>
              <a href="#" className="text-heritage-cream/50 hover:text-heritage-gold transition-colors"><FaTwitter size={18} /></a>
              <a href="#" className="text-heritage-cream/50 hover:text-heritage-gold transition-colors"><FaInstagram size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-heritage-gold mb-4">Explore</h3>
            <ul className="space-y-2">
              {[
                { to: '/places', label: 'All Places' },
                { to: '/map', label: 'Interactive Map' },
                { to: '/stories', label: 'Community Stories' },
                { to: '/register', label: 'Join Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-heritage-cream/70 hover:text-heritage-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-heritage-gold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/places?category=${encodeURIComponent(cat)}`}
                    className="text-sm text-heritage-cream/70 hover:text-heritage-gold transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Map CTA */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-heritage-gold mb-4">Find Heritage Sites</h3>
            <p className="text-sm text-heritage-cream/70 mb-4">
              Explore heritage sites across all 8 divisions of Bangladesh on our interactive map.
            </p>
            <Link to="/map" className="btn-gold text-sm py-2.5 px-5 gap-2">
              <FaMapMarkedAlt className="inline mr-1" /> Open Map
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-heritage-cream/10 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-heritage-cream/40">
            © {new Date().getFullYear()} ইতিহাস – Bangladesh Heritage Explorer. All rights reserved.
          </p>
          <p className="text-xs text-heritage-cream/40 font-bengali">
            বাংলাদেশের ঐতিহ্য সংরক্ষণে আমরা প্রতিশ্রুতিবদ্ধ
          </p>
        </div>
      </div>
    </footer>
  );
}
