import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaBookmark, FaMapMarkerAlt } from 'react-icons/fa';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PlaceCard from '../components/places/PlaceCard';
import toast from 'react-hot-toast';

const TABS = ['Profile', 'Bookmarks', 'Visited'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Edit profile
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (activeTab === 'Bookmarks') {
      setLoadingBookmarks(true);
      authAPI.getBookmarks()
        .then(({ data }) => setBookmarks(data?.data || []))
        .catch(() => {})
        .finally(() => setLoadingBookmarks(false));
    }
  }, [activeTab]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await authAPI.updateProfile({ name, bio });
      updateUser(data?.data || { ...user, name, bio });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPassword(true);
    try {
      await authAPI.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated!');
      setCurrentPassword(''); setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <Helmet><title>Profile – ইতিহাস</title></Helmet>

      <div className="min-h-screen bg-heritage-cream">
        {/* Header */}
        <div className="bg-heritage-green text-white py-12 px-4">
          <div className="max-w-4xl mx-auto flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold">{user?.name}</h1>
              <p className="text-white/70 text-sm mt-0.5">{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="mt-2 inline-block bg-heritage-gold/30 text-heritage-gold text-xs px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-heritage-cream mb-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-heritage-green text-heritage-green'
                    : 'border-transparent text-heritage-dark/60 hover:text-heritage-dark'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'Profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Edit profile */}
              <div className="bg-white rounded-2xl p-6 border border-heritage-cream">
                <h2 className="font-heading font-semibold text-lg mb-5 flex items-center gap-2">
                  <FaUser className="text-heritage-green" /> Edit Profile
                </h2>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-heritage-dark mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-heritage-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-green/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-heritage-dark mb-1.5">Email</label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 text-sm border border-heritage-cream rounded-xl bg-heritage-cream/30 text-heritage-dark/60">
                      <FaEnvelope size={13} /> {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-heritage-dark mb-1.5">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full px-3.5 py-2.5 text-sm border border-heritage-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-green/30 resize-none"
                    />
                  </div>
                  <button type="submit" disabled={savingProfile} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-60">
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              {/* Change password */}
              <div className="bg-white rounded-2xl p-6 border border-heritage-cream">
                <h2 className="font-heading font-semibold text-lg mb-5 flex items-center gap-2">
                  <FaLock className="text-heritage-green" /> Change Password
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-heritage-dark mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-sm border border-heritage-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-green/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-heritage-dark mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Min. 6 characters"
                      className="w-full px-3.5 py-2.5 text-sm border border-heritage-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-green/30"
                    />
                  </div>
                  <button type="submit" disabled={savingPassword} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-60">
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'Bookmarks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-6">
                <FaBookmark className="text-heritage-gold" />
                <h2 className="font-heading font-semibold text-lg">Bookmarked Places</h2>
              </div>
              {loadingBookmarks ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-60 animate-pulse" />)}
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-16">
                  <FaBookmark size={32} className="text-heritage-dark/20 mx-auto mb-3" />
                  <p className="text-heritage-dark/40">No bookmarks yet.</p>
                  <p className="text-sm text-heritage-dark/30 mt-1">Bookmark places to save them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarks.map((place) => <PlaceCard key={place._id} place={place} />)}
                </div>
              )}
            </motion.div>
          )}

          {/* Visited Tab */}
          {activeTab === 'Visited' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-6">
                <FaMapMarkerAlt className="text-heritage-green" />
                <h2 className="font-heading font-semibold text-lg">Visited Places</h2>
              </div>
              <div className="text-center py-16">
                <FaMapMarkerAlt size={32} className="text-heritage-dark/20 mx-auto mb-3" />
                <p className="text-heritage-dark/40">No visited places recorded.</p>
                <p className="text-sm text-heritage-dark/30 mt-1">Mark places as visited from their detail page.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
