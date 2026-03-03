import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) navigate('/');
  };

  return (
    <>
      <Helmet><title>Login – ইতিহাস</title></Helmet>

      <div className="min-h-screen bg-heritage-cream flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <span className="text-4xl font-bengali font-bold text-heritage-green">ইতিহাস</span>
            </Link>
            <h1 className="text-2xl font-heading font-bold text-heritage-dark mt-3">Welcome back</h1>
            <p className="text-sm text-heritage-dark/60 mt-1">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-heritage-cream p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="••••••••"
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
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-sm mt-2 disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-heritage-dark/60 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-heritage-green font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
