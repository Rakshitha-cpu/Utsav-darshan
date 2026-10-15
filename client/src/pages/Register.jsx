import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        navigate('/profile');
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Cannot connect to server.');
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
            Join the Cultural Movement
          </h2>
          <p className="text-xs text-heritage-charcoal/70">
            Create an account to save festivals, track Jatras, and contribute stories.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-heritage-mutedGold absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Rakshitha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-heritage-gold/30 rounded-xl focus:outline-none focus:border-heritage-maroon bg-heritage-ivory/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-heritage-mutedGold absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="you@example.com"
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-heritage-gold/30 rounded-xl focus:outline-none focus:border-heritage-maroon bg-heritage-ivory/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
            >
              <option value="user">Festival Explorer (Visitor)</option>
              <option value="contributor">Community Contributor (Submitter)</option>
              <option value="admin">Platform Administrator (Moderator)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-xs font-semibold bg-heritage-maroon hover:bg-heritage-darkMaroon text-white shadow-md transition-all mt-2"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-heritage-charcoal/70">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-heritage-maroon hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
