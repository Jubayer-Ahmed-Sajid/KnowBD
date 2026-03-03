import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const result = await register(name, email, password);
    if (result.success) navigate('/');
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-heritage-gold', 'bg-heritage-green'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <>
      <Helmet><title>Register – ইতিহাস</title></Helmet>

      <div className="min-h-screen bg-heritage-cream flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <span className="text-4xl font-bengali font-bold text-heritage-green">ইতিহাস</span>
            </Link>
            <h1 className="text-2xl font-heading font-bold text-heritage-dark mt-3">Create an account</h1>
            <p className="text-sm text-heritage-dark/60 mt-1">Join the heritage explorer community</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-heritage-cream p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-heritage-dark mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 text-sm border border-heritage-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-green/30 focus:border-heritage-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heritage-dark mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-heritage-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-green/30 focus:border-heritage-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heritage-dark mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2.5 text-sm border border-heritage-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-green/30 focus:border-heritage-green pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-heritage-dark/40 hover:text-heritage-dark"
                  >
                    {showPass ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1,2,3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${passwordStrength >= i ? strengthColors[passwordStrength] : 'bg-heritage-cream'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-heritage-dark/50">{strengthLabels[passwordStrength]}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-heritage-dark mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat password"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-heritage-green/30 pr-10 ${
                      confirmPassword && password === confirmPassword
                        ? 'border-heritage-green'
                        : confirmPassword
                        ? 'border-red-300'
                        : 'border-heritage-cream'
                    }`}
                  />
                  {confirmPassword && password === confirmPassword && (
                    <FaCheck size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-heritage-green" />
                  )}
                </div>
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-sm mt-2 disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-heritage-dark/60 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-heritage-green font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
