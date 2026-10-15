import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Archive,
  BarChart3,
  Calendar,
  Layers,
  Flag,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' or 'reports' or 'analytics'
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionReason, setActionReason] = useState('');
  const [actionEventId, setActionEventId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }

    fetchAdminData();
  }, [isAuthenticated, isAdmin, navigate, statusFilter]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('utsav_token');

      const [dashRes, subRes, repRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/submissions?status=${statusFilter}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dashData = await dashRes.json();
      const subData = await subRes.json();
      const repData = await repRes.json();

      if (dashData.success) {
        setStats(dashData.stats);
        setCharts(dashData.charts);
      }
      if (subData.success) setSubmissions(subData.submissions);
      if (repData.success) setReports(repData.reports);
    } catch (err) {
      console.error('Failed to load admin moderation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (eventId, action, isVerified = false) => {
    try {
      const token = localStorage.getItem('utsav_token');
      const res = await fetch(`/api/admin/events/${eventId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          reason: actionReason,
          isVerified
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setActionReason('');
        setActionEventId(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error executing moderation action:', err);
    }
  };

  const COLORS = ['#800020', '#FF9933', '#1A237E', '#D4AF37', '#059669', '#6366F1'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-heritage-indigo text-white px-5 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 border border-heritage-gold/40">
          <ShieldCheck className="w-4 h-4 text-heritage-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-heritage-indigo/10 text-heritage-indigo text-xs font-semibold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-heritage-indigo" />
            Verification & Curation Control Panel
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-heritage-maroon mt-1">
            Moderation & Analytics Dashboard
          </h1>
        </div>
        <div className="text-xs text-heritage-charcoal/70 bg-white px-4 py-2 rounded-2xl border border-heritage-gold/30 shadow-xs">
          Logged in as <strong>{user?.name}</strong> (Administrator)
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-heritage-gold/30 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-heritage-charcoal/60 uppercase">Total Listed</p>
          <p className="font-serif-title text-2xl font-bold text-heritage-charcoal">{stats?.totalEvents || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-emerald-800 uppercase">Published</p>
          <p className="font-serif-title text-2xl font-bold text-emerald-700">{stats?.publishedEvents || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-amber-800 uppercase">Pending Review</p>
          <p className="font-serif-title text-2xl font-bold text-amber-600">{stats?.pendingSubmissions || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-orange-200 bg-orange-50/30 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-orange-800 uppercase">Needs Correction</p>
          <p className="font-serif-title text-2xl font-bold text-orange-600">{stats?.needsCorrection || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-red-800 uppercase">Flagged Reports</p>
          <p className="font-serif-title text-2xl font-bold text-red-600">{stats?.openReports || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-heritage-gold/30 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-heritage-charcoal/60 uppercase">Registered Users</p>
          <p className="font-serif-title text-2xl font-bold text-heritage-indigo">{stats?.totalUsers || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-heritage-gold/30 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'submissions'
              ? 'border-heritage-maroon text-heritage-maroon'
              : 'border-transparent text-heritage-charcoal/60 hover:text-heritage-charcoal'
          }`}
        >
          <Layers className="w-4 h-4" />
          Review Queue ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-heritage-maroon text-heritage-maroon'
              : 'border-transparent text-heritage-charcoal/60 hover:text-heritage-charcoal'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Visual Analytics & Trends
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-heritage-maroon text-heritage-maroon'
              : 'border-transparent text-heritage-charcoal/60 hover:text-heritage-charcoal'
          }`}
        >
          <Flag className="w-4 h-4" />
          Community Inaccuracy Reports ({reports.length})
        </button>
      </div>

      {/* Tab 1: Moderation Review Queue */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-heritage-charcoal">Filter Queue:</span>
            {['pending', 'needs_correction', 'published', 'rejected', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-heritage-maroon text-white shadow-xs'
                    : 'bg-white hover:bg-heritage-cream text-heritage-charcoal border border-heritage-gold/30'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-4 border-heritage-maroon border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-6 rounded-3xl border border-heritage-gold/30 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-heritage-gold/20 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-heritage-deepSaffron uppercase tracking-wider">
                          {item.category} • {item.city}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-serif-title text-xl font-bold text-heritage-charcoal mt-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-heritage-charcoal/60">
                        Venue: {item.venue?.name}, {item.venue?.address} | Dates: {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <a
                      href={`/events/${item.slug || item._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-heritage-indigo hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Preview Live Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Submission Evidence & Submitter */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-heritage-cream/40 p-4 rounded-2xl border border-heritage-gold/20">
                    <div>
                      <p className="font-semibold text-heritage-charcoal">Cultural Lore & Significance:</p>
                      <p className="text-heritage-charcoal/80 mt-1 line-clamp-3 leading-relaxed">
                        {item.description || item.culturalSignificance}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p><strong>Submitted By:</strong> {item.contributorName} ({item.contributorContact || 'No contact provided'})</p>
                      <p><strong>Official Source URL:</strong> {item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-heritage-indigo underline">{item.sourceUrl}</a> : 'Not provided'}</p>
                      <p><strong>Evidence Statement:</strong> {item.verificationEvidence || 'None'}</p>
                    </div>
                  </div>

                  {/* Moderator Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReviewAction(item._id, 'approve', true)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve & Mark Verified
                      </button>

                      <button
                        onClick={() => handleReviewAction(item._id, 'approve', false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Publish Unverified
                      </button>

                      <button
                        onClick={() => setActionEventId(actionEventId === item._id ? null : item._id)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-100 hover:bg-orange-200 text-orange-900 flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Request Corrections
                      </button>

                      <button
                        onClick={() => handleReviewAction(item._id, 'reject')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>

                    <button
                      onClick={() => handleReviewAction(item._id, 'archive')}
                      className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive
                    </button>
                  </div>

                  {/* Inline Reason Input Drawer */}
                  {actionEventId === item._id && (
                    <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-3">
                      <label className="block text-xs font-semibold text-orange-900">
                        Reason for rejection or requested corrections (visible to submitter):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Please provide an official brochure or newspaper link confirming 2026 dates..."
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-orange-300 focus:outline-none bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReviewAction(item._id, 'request_correction')}
                          className="px-4 py-1.5 text-xs font-semibold bg-orange-600 text-white rounded-lg"
                        >
                          Send Correction Request
                        </button>
                        <button
                          onClick={() => setActionEventId(null)}
                          className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-heritage-gold/40">
              <p className="font-serif-title text-base font-semibold text-heritage-charcoal">
                Queue is currently empty for status '{statusFilter}'.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Visual Analytics & Charts */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Events by City */}
          <div className="bg-white p-6 rounded-3xl border border-heritage-gold/30 shadow-sm space-y-4">
            <h3 className="font-serif-title text-lg font-bold text-heritage-maroon">
              Published Cultural Events by City
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.eventsByCity || []}>
                  <XAxis dataKey="city" stroke="#2D3142" fontSize={11} />
                  <YAxis stroke="#2D3142" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#800020" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Events by Category */}
          <div className="bg-white p-6 rounded-3xl border border-heritage-gold/30 shadow-sm space-y-4">
            <h3 className="font-serif-title text-lg font-bold text-heritage-maroon">
              Cultural Distribution Across Categories
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.eventsByCategory || []}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {(charts?.eventsByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((rep) => (
              <div
                key={rep._id}
                className="bg-white p-5 rounded-2xl border border-heritage-gold/30 shadow-sm flex flex-col sm:flex-row justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      {rep.reportType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-heritage-charcoal">
                      Target: {rep.event?.name} ({rep.event?.city})
                    </span>
                  </div>
                  <p className="text-xs text-heritage-charcoal/80 mt-2 leading-relaxed">
                    <strong>Report Details:</strong> {rep.description}
                  </p>
                  <p className="text-[11px] text-heritage-charcoal/60 mt-1">
                    Reported on {new Date(rep.createdAt).toLocaleString()} by {rep.reporterEmail}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-heritage-gold/40">
              <p className="font-serif-title text-base font-semibold text-heritage-charcoal">
                No active inaccuracy reports logged by users.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
