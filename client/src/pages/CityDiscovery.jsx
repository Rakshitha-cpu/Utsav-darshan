import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Sparkles, Navigation } from 'lucide-react';
import EventCard from '../components/EventCard';
import MapComponent from '../components/MapComponent';

const CityDiscovery = () => {
  const { citySlug } = useParams();
  const [cityData, setCityData] = useState(null);
  const [cityEvents, setCityEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const cityName = citySlug ? citySlug.charAt(0).toUpperCase() + citySlug.slice(1) : 'Bengaluru';

  useEffect(() => {
    const fetchCityInfo = async () => {
      try {
        setLoading(true);
        const [cityRes, eventsRes] = await Promise.all([
          fetch(`/api/cities/${citySlug || 'bengaluru'}`),
          fetch(`/api/events?city=${cityName}&limit=12`)
        ]);

        const cData = await cityRes.json();
        const evData = await eventsRes.json();

        if (cData.success) setCityData(cData.city);
        if (evData.success) setCityEvents(evData.events);
      } catch (err) {
        console.error('Failed to load city details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCityInfo();
  }, [citySlug, cityName]);

  if (loading) {
    return (
      <div className="text-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-heritage-maroon border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-medium text-heritage-charcoal/60">Loading city cultural profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* City Hero */}
      <div className="relative bg-heritage-cream py-16 border-b border-heritage-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-heritage-maroon/10 text-heritage-maroon text-xs font-semibold tracking-wide uppercase">
              <MapPin className="w-3.5 h-3.5 text-heritage-saffron" />
              Regional Cultural Hub • {cityData?.state || 'Karnataka'}
            </div>
            <h1 className="font-serif-title text-4xl sm:text-5xl font-extrabold text-heritage-maroon">
              {cityData?.name || cityName}
            </h1>
            <p className="text-sm sm:text-base text-heritage-charcoal/80 leading-relaxed font-light">
              {cityData?.description || `${cityName} is home to sacred temple processions, classical musical festivals, and time-honored community celebrations.`}
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="bg-white p-6 rounded-3xl border border-heritage-gold/30 shadow-md w-full md:w-80 space-y-3">
            <h3 className="font-serif-title text-base font-bold text-heritage-maroon">Cultural Snapshot</h3>
            <div className="text-xs space-y-2 text-heritage-charcoal/80">
              <p>• <strong>Active Festivals:</strong> {cityEvents.length} listed</p>
              <p>• <strong>State:</strong> {cityData?.state}</p>
              <p>• <strong>Signature Arts:</strong> {cityData?.culturalHighlights?.slice(0, 2).join(', ')}</p>
            </div>
            <Link
              to={`/calendar`}
              className="inline-block w-full text-center py-2 text-xs font-semibold bg-heritage-cream hover:bg-heritage-maroon hover:text-white rounded-xl transition-colors text-heritage-charcoal border border-heritage-gold/30"
            >
              View Month Calendar
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Cultural Highlights & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Highlights */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-heritage-gold/30 shadow-sm space-y-4">
            <h3 className="font-serif-title text-xl font-bold text-heritage-maroon">
              Living Traditions of {cityData?.name}
            </h3>
            <ul className="space-y-3">
              {cityData?.culturalHighlights?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-heritage-charcoal/80 leading-relaxed">
                  <Sparkles className="w-4 h-4 text-heritage-deepSaffron shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* City Interactive Map */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-heritage-gold/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-title text-xl font-bold text-heritage-maroon">
                {cityData?.name} Cultural Venues Map
              </h3>
              <span className="text-xs text-heritage-mutedGold">OpenStreetMap</span>
            </div>
            <MapComponent
              lat={cityData?.coordinates?.lat || 12.9716}
              lng={cityData?.coordinates?.lng || 77.5946}
              title={`${cityData?.name} Cultural Precinct`}
              address={`${cityData?.name}, ${cityData?.state}`}
              zoom={12}
            />
          </div>
        </div>

        {/* City Events Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-heritage-gold/20">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-heritage-deepSaffron">
                Festival Discovery
              </span>
              <h2 className="font-serif-title text-3xl font-bold text-heritage-maroon mt-0.5">
                Upcoming Celebrations in {cityData?.name}
              </h2>
            </div>
            <Link
              to="/submit"
              className="text-xs font-semibold text-heritage-maroon hover:underline"
            >
              + Submit an Event for {cityData?.name}
            </Link>
          </div>

          {cityEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cityEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-heritage-gold/40">
              <p className="text-sm text-heritage-charcoal/60">
                No festivals currently scheduled for this city.
              </p>
            </div>
          )}
        </section>

        {/* Other Supported Cities Switcher */}
        <section className="bg-heritage-cream/40 p-8 rounded-3xl border border-heritage-gold/20 space-y-4">
          <h3 className="font-serif-title text-lg font-bold text-heritage-maroon">
            Explore Other Cultural Cities
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Bengaluru', slug: 'bengaluru' },
              { name: 'Mysuru', slug: 'mysuru' },
              { name: 'Mangaluru', slug: 'mangaluru' },
              { name: 'Chennai', slug: 'chennai' },
              { name: 'Kolkata', slug: 'kolkata' },
              { name: 'Jaipur', slug: 'jaipur' },
              { name: 'Mumbai', slug: 'mumbai' },
              { name: 'Kochi', slug: 'kochi' }
            ].map((c) => (
              <Link
                key={c.slug}
                to={`/cities/${c.slug}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  c.slug === citySlug
                    ? 'bg-heritage-maroon text-white shadow-sm'
                    : 'bg-white hover:bg-heritage-gold/20 text-heritage-charcoal border border-heritage-gold/30'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CityDiscovery;
