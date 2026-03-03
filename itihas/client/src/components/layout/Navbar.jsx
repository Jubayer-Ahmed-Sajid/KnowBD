import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaMapMarkedAlt, FaBookmark } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/places', label: 'Places' },
  { to: '/map', label: 'Map' },
  { to: '/stories', label: 'Stories' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-heritage-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-bengali font-bold text-heritage-green group-hover:text-heritage-gold transition-colors">
                ইতিহাস
              </span>
              <span className="text-xs text-heritage-dark/50 font-body tracking-widest uppercase">
                Heritage Explorer
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-heritage-green text-white'
                      : 'text-heritage-dark hover:bg-heritage-cream hover:text-heritage-green'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-heritage-cream transition-colors"
                >
                  <div className="w-8 h-8 bg-heritage-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-heritage-dark">{user.name}</span>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-heritage-cream overflow-hidden"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-heritage-dark hover:bg-heritage-cream"
                      >
                        <FaUser className="text-heritage-green" /> Profile
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-heritage-dark hover:bg-heritage-cream"
                      >
                        <FaBookmark className="text-heritage-gold" /> Bookmarks
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-heritage-dark hover:text-heritage-green transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-heritage-dark hover:bg-heritage-cream"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-heritage-cream overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-heritage-green text-white'
                        : 'text-heritage-dark hover:bg-heritage-cream'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-heritage-cream">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-heritage-dark hover:bg-heritage-cream rounded-lg"
                    >
                      <FaUser /> Profile
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium text-heritage-green border border-heritage-green rounded-lg">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium bg-heritage-green text-white rounded-lg">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
