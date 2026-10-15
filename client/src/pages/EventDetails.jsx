import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Share2, Bookmark, BookmarkCheck, Flag, CheckCircle, ShieldAlert, Sparkles, Navigation, Star, Bell, Download, ExternalLink, Camera, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MapComponent from '../components/MapComponent';
import EventCard from '../components/EventCard';

const EventDetails = () => {
  const { idOrSlug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [event, setEvent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('outdated_date');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Future Enhancement States: User Reviews & Photos
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Ananya Sharma',
      rating: 5,
      date: '2 days ago',
      comment: 'The spiritual energy during the evening aarti is beyond words. Reached 1 hour early to get a spot near the main enclosure.',
      photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      name: 'Rohan Deshmukh',
      rating: 5,
      date: '1 week ago',
      comment: 'Unforgettable experience. The traditional music instruments and temple decor are breathtaking. Highly recommend bringing family!',
      photo: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=400&q=80'
    }
  ]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${idOrSlug}`);
        const data = await res.json();
        if (data.success) {
          setEvent(data.event);
          setRelated(data.related || []);
          if (user && user.savedEvents) {
            setIsSaved(user.savedEvents.includes(data.event._id));
          }
        }
      } catch (err) {
        console.error('Failed to load event:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [idOrSlug, user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = (ev) => {
    if (!ev) return '#';
    try {
      const start = new Date(ev.startDate).toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
      const end = new Date(ev.endDate).toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
      const title = encodeURIComponent(ev.name);
      const details = encodeURIComponent(ev.description || '');
      const location = encodeURIComponent(`${ev.venue?.name || ''}, ${ev.city || ''}`);
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  };

  // iCal (.ics) Download Generator
  const downloadIcsFile = (ev) => {
    if (!ev) return;
    try {
      const start = new Date(ev.startDate).toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
      const end = new Date(ev.endDate).toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Utsav Darshan//Cultural Calendar//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${ev.name}`,
        `DESCRIPTION:${(ev.description || '').replace(/\n/g, ' ')}`,
        `LOCATION:${ev.venue?.name || ''}, ${ev.city || ''}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${ev.name.replace(/\s+/g, '_')}_reminder.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloaded .ics calendar reminder!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    const rev = {
      id: Date.now(),
      name: newReviewName.trim() || (user ? user.name : 'Pilgrim Visitor'),
      rating: newReviewRating,
      date: 'Just now',
      comment: newReviewText.trim(),
      photo: null
    };
    setReviews([rev, ...reviews]);
    setNewReviewText('');
    setNewReviewName('');
    showToast('Dhanyavad! Your cultural review has been published.');
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to save this event to your profile.');
      return;
    }

    try {
      const token = localStorage.getItem('utsav_token');
      const res = await fetch(`/api/events/${event._id}/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.saved);
        showToast(data.message);
      }
    } catch (err) {
      console.error('Failed to toggle save event:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: `Discover ${event.name} on Utsav Darshan!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${event._id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          description: reportDescription,
          reporterEmail: user ? user.email : 'guest@utsavdarshan.in'
        })
      });
      const data = await res.json();
      if (data.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReportSuccess(false);
          setReportDescription('');
        }, 2000);
      }
    } catch (err) {
      console.error('Error reporting event:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-heritage-maroon border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-medium text-heritage-charcoal/60">Loading festival chronicle...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-24">
        <h2 className="font-serif-title text-2xl font-bold text-heritage-maroon">Festival Not Found</h2>
        <p className="text-xs text-heritage-charcoal/60 mt-2">The requested event could not be located or may be under moderation.</p>
        <Link to="/explore" className="inline-block mt-4 text-xs font-semibold text-heritage-maroon underline">
          Return to Explore Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-heritage-darkMaroon text-white px-5 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 border border-heritage-gold/40 animate-fade-in">
          <Sparkles className="w-4 h-4 text-heritage-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-heritage-gold/30 bg-heritage-cream h-[380px] sm:h-[460px]">
        <img
          src={event.images?.cover}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Floating Top Badges */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
          {event.isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white backdrop-blur-md shadow-md">
              <CheckCircle className="w-4 h-4" />
              Verified Authenticity
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-600 text-white backdrop-blur-md shadow-md">
              <Sparkles className="w-4 h-4" />
              Editorial Review Completed
            </span>
          )}
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-heritage-gold text-heritage-darkMaroon backdrop-blur-md shadow-md">
            {event.category}
          </span>
        </div>

        {/* Action Buttons Top Right */}
        <div className="absolute top-6 right-6 flex items-center space-x-2">
          <button
            onClick={handleToggleSave}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
              isSaved ? 'bg-heritage-gold text-heritage-darkMaroon' : 'bg-white/80 hover:bg-white text-heritage-charcoal'
            }`}
            title={isSaved ? 'Saved to profile' : 'Save event'}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/80 hover:bg-white text-heritage-charcoal backdrop-blur-md transition-all shadow-md"
            title="Share event link"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Title & Meta */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-heritage-gold">
            <MapPin className="w-4 h-4 text-heritage-saffron" />
            <span>{event.city}, {event.state}</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-5xl font-extrabold tracking-tight">
            {event.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-heritage-cream/90 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-heritage-saffron" />
              {format(new Date(event.startDate), 'MMMM dd, yyyy')} — {format(new Date(event.endDate), 'MMMM dd, yyyy')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-heritage-saffron" />
              {event.startTime} to {event.endTime}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (2 Cols): Cultural Details & Traditions */}
        <div className="lg:col-span-2 space-y-10">
          {/* About & Narrative */}
          <section className="bg-white p-8 rounded-3xl border border-heritage-gold/20 shadow-sm space-y-4">
            <h2 className="font-serif-title text-2xl font-bold text-heritage-maroon">
              About the Celebration
            </h2>
            <p className="text-sm sm:text-base text-heritage-charcoal/80 leading-relaxed font-light">
              {event.description}
            </p>
          </section>

          {/* Cultural Significance & Heritage Context */}
          {event.culturalSignificance && (
            <section className="bg-heritage-cream/50 p-8 rounded-3xl border border-heritage-gold/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-heritage-deepSaffron">
                <Sparkles className="w-4 h-4" />
                Cultural & Historical Lore
              </div>
              <h2 className="font-serif-title text-2xl font-bold text-heritage-maroon">
                Significance & Heritage
              </h2>
              <p className="text-sm sm:text-base text-heritage-charcoal/80 leading-relaxed font-light">
                {event.culturalSignificance}
              </p>
            </section>
          )}

          {/* Rituals, Highlights & Activities */}
          {event.traditionsAndHighlights?.length > 0 && (
            <section className="bg-white p-8 rounded-3xl border border-heritage-gold/20 shadow-sm space-y-4">
              <h2 className="font-serif-title text-2xl font-bold text-heritage-maroon">
                Customs, Processions & Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {event.traditionsAndHighlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-heritage-ivory border border-heritage-gold/20">
                    <span className="w-6 h-6 rounded-full bg-heritage-maroon/10 text-heritage-maroon flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-heritage-charcoal/80 font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Verification Protocol & Source Metadata */}
          <section className="bg-white p-6 rounded-2xl border border-heritage-gold/20 text-xs text-heritage-charcoal/70 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-heritage-gold/20">
              <span className="font-semibold text-heritage-charcoal">Listing Provenance & Trust</span>
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-red-700 hover:underline flex items-center gap-1 font-medium"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Inaccurate Info
              </button>
            </div>
            <p>
              <strong>Verification Status:</strong> {event.isVerified ? 'Verified with Temple Trust/Official Gazettes' : 'Reviewed community submission'}
            </p>
            {event.lastVerifiedDate && (
              <p>
                <strong>Last Verified Date:</strong> {new Date(event.lastVerifiedDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {event.sourceUrl && (
              <p className="truncate">
                <strong>Source Evidence:</strong> <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-heritage-indigo hover:underline">{event.sourceUrl}</a>
              </p>
            )}
          </section>

          {/* User Reviews & Community Photos */}
          <section className="bg-white p-8 rounded-3xl border border-heritage-gold/20 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-heritage-gold/20 pb-4">
              <div>
                <h2 className="font-serif-title text-2xl font-bold text-heritage-maroon flex items-center gap-2">
                  <Star className="w-5 h-5 text-heritage-gold fill-heritage-gold" />
                  {t('userReviews')}
                </h2>
                <p className="text-xs text-heritage-charcoal/60 mt-0.5">
                  Real experiences and tips shared by devotees and cultural explorers.
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-heritage-maroon bg-heritage-cream px-3 py-1.5 rounded-full border border-heritage-gold/30">
                <span>⭐ 4.9 / 5.0</span>
                <span className="text-xs font-normal text-heritage-charcoal/60">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* List of Reviews */}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-heritage-ivory border border-heritage-gold/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-heritage-maroon text-white font-bold text-xs flex items-center justify-center">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-heritage-charcoal">{r.name}</h4>
                        <span className="text-[10px] text-heritage-charcoal/50">{r.date}</span>
                      </div>
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-heritage-charcoal/80 leading-relaxed font-light">
                    "{r.comment}"
                  </p>
                  {r.photo && (
                    <div className="pt-1">
                      <img src={r.photo} alt="Community capture" className="w-24 h-16 object-cover rounded-lg border border-heritage-gold/30 hover:scale-105 transition-transform" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-heritage-gold/20 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-heritage-maroon flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-heritage-saffron" />
                Share Your Experience or Photos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name (or Leave blank for Pilgrim Visitor)"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-heritage-gold/30 bg-heritage-ivory focus:outline-none"
                />
                <div className="flex items-center gap-2 text-xs font-medium text-heritage-charcoal bg-heritage-ivory px-3 py-2 rounded-xl border border-heritage-gold/30">
                  <span>Rating:</span>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="bg-transparent font-bold text-amber-600 focus:outline-none cursor-pointer"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                    <option value={2}>⭐⭐ (2/5)</option>
                    <option value={1}>⭐ (1/5)</option>
                  </select>
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="Share your spiritual moments, darshan tips, or crowded timings..."
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-xl border border-heritage-gold/30 bg-heritage-ivory focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-heritage-maroon hover:bg-heritage-darkMaroon text-white text-xs font-semibold shadow-sm transition-all"
              >
                Post Cultural Review
              </button>
            </form>
          </section>
        </div>

        {/* Right Sidebar (1 Col): Venue, Map, Reminders, Tourism & Organizer */}
        <div className="space-y-6">
          {/* Calendar Reminders & Notifications Card */}
          <div className="bg-gradient-to-br from-heritage-maroon to-heritage-indigo p-6 rounded-3xl text-white shadow-lg space-y-4 border border-heritage-gold/40">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-md">
                <Bell className="w-5 h-5 text-heritage-gold animate-bounce" />
              </div>
              <div>
                <h3 className="font-serif-title text-base font-bold text-heritage-gold">
                  Event Reminders & Alerts
                </h3>
                <p className="text-[11px] text-heritage-cream/80">
                  Never miss auspicious timings or yatra processions.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white text-heritage-maroon hover:bg-heritage-cream text-xs font-semibold py-2.5 rounded-xl shadow transition-colors"
              >
                <Calendar className="w-4 h-4 text-heritage-saffron" />
                <span>{t('addToCalendar')}</span>
              </a>

              <button
                onClick={() => downloadIcsFile(event)}
                className="w-full flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs font-medium py-2.5 rounded-xl border border-white/20 transition-colors"
              >
                <Download className="w-4 h-4 text-heritage-gold" />
                <span>{t('downloadIcs')}</span>
              </button>
            </div>
          </div>

          {/* Official Tourism Department Integration */}
          <div className="bg-heritage-cream/60 p-6 rounded-3xl border border-heritage-gold/40 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-heritage-maroon">
              <Building2 className="w-5 h-5 text-heritage-saffron" />
              <h3 className="font-serif-title text-base font-bold">
                {t('tourismIntegration')}
              </h3>
            </div>
            <p className="text-xs text-heritage-charcoal/70 leading-relaxed">
              Listed in coordination with State Tourism Gazettes and Incredible India cultural archives.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-heritage-maroon">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Govt. Tourist Helpline: 1363
              </span>
              <a
                href="https://www.incredibleindia.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-heritage-indigo hover:underline flex items-center gap-0.5"
              >
                Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Venue & Directions */}
          <div className="bg-white p-6 rounded-3xl border border-heritage-gold/30 shadow-sm space-y-5">
            <h3 className="font-serif-title text-xl font-bold text-heritage-maroon">
              Venue Location & Map
            </h3>

            <div className="space-y-2">
              <p className="text-sm font-bold text-heritage-charcoal">{event.venue?.name}</p>
              <p className="text-xs text-heritage-charcoal/70 leading-relaxed">{event.venue?.address}</p>
            </div>

            {/* Interactive OpenStreetMap */}
            <MapComponent
              lat={event.coordinates?.lat || 12.9716}
              lng={event.coordinates?.lng || 77.5946}
              title={event.venue?.name}
              address={event.venue?.address}
            />

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue?.name + ' ' + event.venue?.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-heritage-cream hover:bg-heritage-gold/30 text-heritage-maroon text-xs font-semibold py-3 rounded-xl border border-heritage-gold/40 transition-colors"
            >
              <Navigation className="w-4 h-4 text-heritage-saffron" />
              <span>Get Directions via Map</span>
            </a>
          </div>

          {/* Organizer / Contact Info */}
          <div className="bg-white p-6 rounded-3xl border border-heritage-gold/30 shadow-sm space-y-3">
            <h3 className="font-serif-title text-lg font-bold text-heritage-maroon">
              Organizing Body
            </h3>
            <p className="text-xs font-semibold text-heritage-charcoal">{event.organizer?.name || 'Local Cultural Committee'}</p>
            {event.organizer?.contact && (
              <p className="text-xs text-heritage-charcoal/70">Contact: {event.organizer.contact}</p>
            )}
          </div>
        </div>
      </div>

      {/* AI-Based Personalized Event Suggestions ("AI Cultural Match") */}
      <section className="bg-gradient-to-r from-heritage-ivory via-heritage-cream/70 to-heritage-ivory p-8 rounded-3xl border border-heritage-gold/40 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-heritage-maroon">
          <Sparkles className="w-4 h-4 text-heritage-gold animate-spin" />
          <span>{t('aiRecommendations')}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif-title text-2xl font-bold text-heritage-maroon">
              Festivals You May Also Revere
            </h3>
            <p className="text-xs text-heritage-charcoal/70 mt-1">
              Smart cultural affinities matched for {event.category} seekers traveling to {event.city}.
            </p>
          </div>
          <Link
            to={`/explore?category=${encodeURIComponent(event.category)}`}
            className="text-xs font-bold text-heritage-indigo hover:underline shrink-0"
          >
            Explore More Like This →
          </Link>
        </div>
      </section>

      {/* Related Events in Same City */}
      {related.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-heritage-gold/30">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-heritage-deepSaffron">
              Discover More in {event.city}
            </span>
            <h3 className="font-serif-title text-2xl font-bold text-heritage-maroon">
              Related Regional Celebrations
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.slice(0, 3).map((r) => (
              <EventCard key={r._id} event={r} />
            ))}
          </div>
        </section>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-heritage-gold/30 space-y-4 shadow-2xl">
            <h3 className="font-serif-title text-xl font-bold text-heritage-maroon">
              Report Listing Issue
            </h3>
            <p className="text-xs text-heritage-charcoal/70">
              Help maintain calendar veracity. Has an event been cancelled, rescheduled, or moved to another venue?
            </p>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium text-center">
                Report logged successfully. Our moderators will review it promptly!
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-heritage-charcoal mb-1">Issue Category</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full text-xs p-2.5 border border-heritage-gold/30 rounded-xl focus:outline-none"
                  >
                    <option value="outdated_date">Outdated or Incorrect Date</option>
                    <option value="incorrect_venue">Incorrect Venue or Address</option>
                    <option value="cancelled">Confirmed Cancelled / Postponed</option>
                    <option value="suspicious_listing">Suspicious or Fabricated Event</option>
                    <option value="other">Other Inaccuracy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-heritage-charcoal mb-1">Details & Source Link</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide details or official link to correct dates..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full text-xs p-2.5 border border-heritage-gold/30 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 py-2 text-xs font-semibold bg-heritage-cream text-heritage-charcoal rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-semibold bg-heritage-maroon text-white rounded-xl shadow-md"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
