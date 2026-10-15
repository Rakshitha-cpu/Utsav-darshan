import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Sparkles, User, Calendar, LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import EventCard from '../components/EventCard';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'submissions'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('utsav_token');

        const [savedRes, subsRes] = await Promise.all([
          fetch('/api/users/me/saved-events', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/users/me/submissions', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const savedData = await savedRes.json();
        const subsData = await subsRes.json();

        if (savedData.success) setSavedEvents(savedData.savedEvents);
        if (subsData.success) setMySubmissions(subsData.submissions);
      } catch (err) {
        console.error('Failed to load user profile items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-white p-8 rounded-3xl border border-heritage-gold/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-heritage-maroon to-heritage-indigo text-heritage-gold flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-title text-2xl font-bold text-heritage-maroon">
                {user?.name}
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-heritage-saffron/20 text-heritage-darkMaroon">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-heritage-charcoal/60 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/submit"
            className="text-xs font-semibold bg-heritage-cream hover:bg-heritage-gold/30 text-heritage-maroon px-4 py-2.5 rounded-full border border-heritage-gold/30 transition-colors"
          >
            + Submit New Event
          </Link>
          <button
            onClick={logout}
            className="text-xs font-semibold text-red-600 hover:text-red-700 px-4 py-2.5 rounded-full hover:bg-red-50 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-heritage-gold/30 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-heritage-maroon text-heritage-maroon'
              : 'border-transparent text-heritage-charcoal/60 hover:text-heritage-charcoal'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Celebrations ({savedEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'submissions'
              ? 'border-heritage-maroon text-heritage-maroon'
              : 'border-transparent text-heritage-charcoal/60 hover:text-heritage-charcoal'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          My Submissions & Moderation Status ({mySubmissions.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-heritage-maroon border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : activeTab === 'saved' ? (
        savedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedEvents.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-heritage-gold/40 space-y-2">
            <Bookmark className="w-8 h-8 text-heritage-mutedGold mx-auto opacity-40" />
            <p className="font-serif-title text-base font-semibold text-heritage-charcoal">
              You haven't bookmarked any festivals yet.
            </p>
            <Link to="/explore" className="inline-block text-xs font-semibold text-heritage-maroon underline">
              Browse festivals and bookmark celebrations you want to attend →
            </Link>
          </div>
        )
      ) : (
        mySubmissions.length > 0 ? (
          <div className="space-y-4">
            {mySubmissions.map((sub) => {
              const statusBadges = {
                published: { label: 'Approved & Published', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
                pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800', icon: Clock },
                needs_correction: { label: 'Needs Correction', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
                rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertCircle }
              };
              const badge = statusBadges[sub.status] || statusBadges.pending;
              const IconComp = badge.icon;

              return (
                <div key={sub._id} className="bg-white p-5 rounded-2xl border border-heritage-gold/30 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                      <IconComp className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <h3 className="font-serif-title text-lg font-bold text-heritage-charcoal mt-1">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-heritage-charcoal/60">
                      {sub.venue?.name}, {sub.city} • Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                    {sub.reviewNotes && (
                      <div className="mt-2 text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200">
                        <strong>Moderation Note:</strong> {sub.reviewNotes}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/events/${sub.slug || sub._id}`}
                    className="text-xs font-semibold bg-heritage-cream hover:bg-heritage-maroon hover:text-white px-4 py-2 rounded-full border border-heritage-gold/30 transition-colors"
                  >
                    View Listing
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-heritage-gold/40 space-y-2">
            <Sparkles className="w-8 h-8 text-heritage-mutedGold mx-auto opacity-40" />
            <p className="font-serif-title text-base font-semibold text-heritage-charcoal">
              You haven't submitted any festival listings yet.
            </p>
            <Link to="/submit" className="inline-block text-xs font-semibold text-heritage-maroon underline">
              Share your local festival with India →
            </Link>
          </div>
        )
      )}
    </div>
  );
};

export default Profile;
