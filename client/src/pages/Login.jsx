import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@utsavdarshan.in');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      } else {
        setErrorMsg(data.message || 'Authentication failed');
      }
    } catch (err) {
      setErrorMsg('Cannot connect to login server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-heritage-gold/30 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-heritage-saffron/20 text-heritage-maroon mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-heritage-deepSaffron" />
          </div>
          <h2 className="font-serif-title text-2xl font-bold text-heritage-maroon">
            Sign In to Utsav Darshan
          </h2>
          <p className="text-xs text-heritage-charcoal/70">
            Access your saved cultural celebrations and moderation duties.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-heritage-mutedGold absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-heritage-gold/30 rounded-xl focus:outline-none focus:border-heritage-maroon bg-heritage-ivory/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-heritage-mutedGold absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-heritage-gold/30 rounded-xl focus:outline-none focus:border-heritage-maroon bg-heritage-ivory/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-xs font-semibold bg-heritage-maroon hover:bg-heritage-darkMaroon text-white shadow-md transition-all mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Helper */}
        <div className="p-4 rounded-2xl bg-heritage-cream/60 border border-heritage-gold/30 text-xs text-heritage-charcoal/80 space-y-1">
          <p className="font-semibold text-heritage-maroon">Quick Demonstration Accounts:</p>
          <div className="space-y-0.5 text-[11px]">
            <p>• <strong>Admin:</strong> admin@utsavdarshan.in / password123</p>
            <p>• <strong>Contributor:</strong> contributor@utsavdarshan.in / password123</p>
          </div>
        </div>

        <div className="text-center text-xs text-heritage-charcoal/70">
          New to Utsav Darshan?{' '}
          <Link to="/register" className="font-semibold text-heritage-maroon hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
