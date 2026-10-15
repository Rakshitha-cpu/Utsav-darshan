import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ShieldCheck, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubmitEvent = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cultural Festivals',
    city: 'Bengaluru',
    state: 'Karnataka',
    venueName: '',
    venueAddress: '',
    startDate: '',
    endDate: '',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    description: '',
    culturalSignificance: '',
    traditions: '',
    organizerName: '',
    sourceUrl: '',
    verificationEvidence: '',
    coverImage: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
    contributorName: user ? user.name : '',
    contributorContact: user ? user.email : ''
  });

  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        city: formData.city,
        state: formData.state,
        venue: {
          name: formData.venueName,
          address: formData.venueAddress
        },
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description,
        culturalSignificance: formData.culturalSignificance,
        traditionsAndHighlights: formData.traditions
          ? formData.traditions.split(',').map((t) => t.trim())
          : [],
        organizer: {
          name: formData.organizerName || 'Local Cultural Committee'
        },
        sourceUrl: formData.sourceUrl,
        verificationEvidence: formData.verificationEvidence,
        images: {
          cover: formData.coverImage,
          gallery: []
        },
        contributorName: formData.contributorName,
        contributorContact: formData.contributorContact
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionSuccess(true);
        if (data.duplicateWarning) {
          setDuplicateWarning(data.duplicateWarning);
        }
      } else {
        setErrorMsg(data.message || 'Submission failed');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to moderation server.');
    } finally {
      setLoading(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif-title text-3xl font-bold text-heritage-maroon">
          Event Successfully Submitted!
        </h2>
        <p className="text-sm text-heritage-charcoal/80 leading-relaxed max-w-lg mx-auto">
          Thank you for enriching Utsav Darshan. Your submission has entered our **Pending Review Queue**. Our editorial and cultural verification team will inspect the source evidence before publishing it to the public calendar.
        </p>

        {duplicateWarning && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-800 text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Duplicate Check Notice</p>
              <p className="mt-0.5">{duplicateWarning}</p>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-heritage-maroon text-white hover:bg-heritage-darkMaroon shadow-md transition-all"
          >
            Explore Published Festivals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-heritage-saffron/20 text-heritage-maroon text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Community Cultural Contribution
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-heritage-maroon mt-2">
          Share a Festival or Temple Jatra
        </h1>
        <p className="text-sm text-heritage-charcoal/70 mt-1">
          Help citizens discover authentic celebrations. All submissions are verified by administrators before going live.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 text-xs font-medium border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-heritage-gold/30 shadow-sm space-y-6">
        {/* Section 1: Event Identity */}
        <div className="space-y-4">
          <h3 className="font-serif-title text-xl font-bold text-heritage-maroon border-b border-heritage-gold/20 pb-2">
            1. Event Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
              Event / Festival Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Mysuru Dasara or Bengaluru Karaga"
              value={formData.name}
              onChange={handleChange}
              className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none focus:border-heritage-maroon bg-heritage-ivory/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
              >
                <option value="Temple & Spiritual">Temple & Spiritual</option>
                <option value="Cultural Festivals">Cultural Festivals</option>
                <option value="Traditional Music & Dance">Traditional Music & Dance</option>
                <option value="Folk & Jatras">Folk & Jatras</option>
                <option value="Art & Handicrafts">Art & Handicrafts</option>
                <option value="Cuisine & Food Fairs">Cuisine & Food Fairs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                placeholder="e.g. Bengaluru"
                value={formData.city}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                required
                placeholder="e.g. Karnataka"
                value={formData.state}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Venue & Location */}
        <div className="space-y-4">
          <h3 className="font-serif-title text-xl font-bold text-heritage-maroon border-b border-heritage-gold/20 pb-2">
            2. Venue & Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                name="venueName"
                required
                placeholder="e.g. Bull Temple (Basavanagudi)"
                value={formData.venueName}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
                Full Address *
              </label>
              <input
                type="text"
                name="venueAddress"
                required
                placeholder="Street address, landmark, pin code"
                value={formData.venueAddress}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dates & Timings */}
        <div className="space-y-4">
          <h3 className="font-serif-title text-xl font-bold text-heritage-maroon border-b border-heritage-gold/20 pb-2">
            3. Dates & Timings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Narrative & Significance */}
        <div className="space-y-4">
          <h3 className="font-serif-title text-xl font-bold text-heritage-maroon border-b border-heritage-gold/20 pb-2">
            4. Cultural Significance & Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Provide a comprehensive summary of the celebration..."
              value={formData.description}
              onChange={handleChange}
              className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
              Cultural & Mythological Significance
            </label>
            <textarea
              name="culturalSignificance"
              rows={2}
              placeholder="Why is this celebrated? Folklore, historical origins..."
              value={formData.culturalSignificance}
              onChange={handleChange}
              className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
              Traditions & Highlights (Comma separated)
            </label>
            <input
              type="text"
              name="traditions"
              placeholder="e.g. Floral pyramid balancing, Sword dance, Midnight street procession"
              value={formData.traditions}
              onChange={handleChange}
              className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
            />
          </div>
        </div>

        {/* Section 5: Trust, Verification & Sources */}
        <div className="space-y-4">
          <h3 className="font-serif-title text-xl font-bold text-heritage-maroon border-b border-heritage-gold/20 pb-2">
            5. Verification Evidence & Source URL
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
                Official Source URL (Temple site, Govt gazette, News link)
              </label>
              <input
                type="url"
                name="sourceUrl"
                placeholder="https://..."
                value={formData.sourceUrl}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
                Organizing Body Name
              </label>
              <input
                type="text"
                name="organizerName"
                placeholder="e.g. Sri Dharmaraya Swamy Temple Trust"
                value={formData.organizerName}
                onChange={handleChange}
                className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal mb-1">
              Event Image URL
            </label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full text-xs p-3 border border-heritage-gold/30 rounded-xl focus:outline-none bg-heritage-ivory/30"
            />
          </div>
        </div>

        {/* Submission Button */}
        <div className="pt-4 border-t border-heritage-gold/20 flex items-center justify-between">
          <span className="text-[11px] text-heritage-charcoal/60">
            * All submissions undergo admin verification before publishing.
          </span>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-full text-xs font-semibold bg-heritage-maroon hover:bg-heritage-darkMaroon text-white shadow-md transition-all flex items-center gap-2"
          >
            {loading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-heritage-gold" />
                <span>Submit For Moderation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitEvent;
