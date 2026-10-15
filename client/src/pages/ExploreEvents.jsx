import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, LayoutGrid, List, MapPin, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import EventCard from '../components/EventCard';

const ExploreEvents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cityFallbackEvents, setCityFallbackEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter States initialized from URL params
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || 'All');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'All');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true');
  const [sortBy, setSortBy] = useState('upcoming');

  useEffect(() => {
    // Fetch filter options (cities & categories)
    const fetchMetadata = async () => {
      try {
        const [cRes, catRes] = await Promise.all([
          fetch('/api/cities'),
          fetch('/api/categories')
        ]);
        const cData = await cRes.json();
        const catData = await catRes.json();
        if (cData.success) setCities(cData.cities);
        if (catData.success) setCategories(catData.categories);
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (cityFilter && cityFilter !== 'All') query.append('city', cityFilter);
      if (categoryFilter && categoryFilter !== 'All') query.append('category', categoryFilter);
      if (searchTerm.trim()) query.append('search', searchTerm.trim());
      if (verifiedOnly) query.append('isVerified', 'true');
      if (sortBy === 'newest') query.append('sort', 'newest');
      if (sortBy === 'name') query.append('sort', 'name');

      const res = await fetch(`/api/events?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);

        // If no events match this exact cross-filter, find all events for this city to prevent dead ends!
        if (data.events.length === 0 && cityFilter !== 'All') {
          const fallbackRes = await fetch(`/api/events?city=${encodeURIComponent(cityFilter)}`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success) {
            setCityFallbackEvents(fallbackData.events);
          }
        } else {
          setCityFallbackEvents([]);
        }
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Sync state with URL search params
    const newParams = {};
    if (cityFilter !== 'All') newParams.city = cityFilter;
    if (categoryFilter !== 'All') newParams.category = categoryFilter;
    if (searchTerm) newParams.search = searchTerm;
    if (verifiedOnly) newParams.verified = 'true';
    setSearchParams(newParams, { replace: true });
  }, [cityFilter, categoryFilter, searchTerm, verifiedOnly, sortBy]);

  const handleResetFilters = () => {
    setCityFilter('All');
    setCategoryFilter('All');
    setSearchTerm('');
    setVerifiedOnly(false);
    setSortBy('upcoming');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Header */}
      <div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-heritage-maroon">
          Explore Festivals & Cultural Happenings
        </h1>
        <p className="text-sm text-heritage-charcoal/70 mt-1">
          Search across verified regional melas, temple rathotsavas, and classical music festivals across India.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-heritage-gold/30 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal/80 mb-1">
              Search by Keyword
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-heritage-mutedGold absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Festival, artist, or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-heritage-gold/30 rounded-lg focus:outline-none focus:border-heritage-maroon bg-heritage-ivory/40"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal/80 mb-1">
              Select City
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-heritage-gold/30 rounded-lg focus:outline-none focus:border-heritage-maroon bg-heritage-ivory/40"
            >
              <option value="All">All Cities (India)</option>
              {cities.map((c) => (
                <option key={c._id} value={c.name}>{c.name} ({c.state})</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal/80 mb-1">
              Cultural Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-heritage-gold/30 rounded-lg focus:outline-none focus:border-heritage-maroon bg-heritage-ivory/40"
            >
              <option value="All">All Cultural Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal/80 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-heritage-gold/30 rounded-lg focus:outline-none focus:border-heritage-maroon bg-heritage-ivory/40"
            >
              <option value="upcoming">Upcoming Date First</option>
              <option value="newest">Recently Added</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Sub-toolbar: Checkbox, Count, Clear, View Mode */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-heritage-gold/20 gap-3">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-heritage-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-heritage-maroon focus:ring-heritage-maroon"
              />
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified listings only
              </span>
            </label>

            <button
              onClick={handleResetFilters}
              className="text-xs text-heritage-mutedGold hover:text-heritage-maroon flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all filters
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-heritage-charcoal/60 font-medium">
              Showing {events.length} festivals
            </span>

            {/* View Mode Toggle */}
            <div className="flex border border-heritage-gold/30 rounded-lg overflow-hidden bg-heritage-ivory">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-heritage-maroon text-white' : 'text-heritage-charcoal/70'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 ${viewMode === 'list' ? 'bg-heritage-maroon text-white' : 'text-heritage-charcoal/70'}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid or List */}
      {loading ? (
        <div className="text-center py-24 space-y-3">
          <div className="w-10 h-10 border-4 border-heritage-maroon border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-heritage-charcoal/60">Fetching festival listings...</p>
        </div>
      ) : events.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white p-4 rounded-xl border border-heritage-gold/20 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={event.images?.cover}
                    alt={event.name}
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-heritage-deepSaffron">
                      {event.category} • {event.city}
                    </span>
                    <h3 className="font-serif-title text-base font-bold text-heritage-charcoal">
                      {event.name}
                    </h3>
                    <p className="text-xs text-heritage-charcoal/60 mt-0.5 line-clamp-1">
                      {event.venue?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-xs font-medium text-heritage-mutedGold">
                    {new Date(event.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <a
                    href={`/events/${event.slug || event._id}`}
                    className="text-xs font-semibold bg-heritage-cream hover:bg-heritage-maroon hover:text-white px-4 py-2 rounded-full transition-colors text-heritage-charcoal border border-heritage-gold/30 shrink-0"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      ) : cityFallbackEvents.length > 0 ? (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-gradient-to-r from-amber-50 via-heritage-cream/60 to-amber-50 rounded-3xl border border-heritage-gold/40 p-6 sm:p-8 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-heritage-gold/20 flex items-center justify-center mx-auto text-heritage-maroon">
              <Sparkles className="w-5 h-5 text-heritage-saffron" />
            </div>
            <h3 className="font-serif-title text-xl font-bold text-heritage-maroon">
              No "{categoryFilter}" festivals found in {cityFilter}
            </h3>
            <p className="text-xs text-heritage-charcoal/70 max-w-lg mx-auto leading-relaxed">
              We couldn't find exact matches for this category, but here are <strong>{cityFallbackEvents.length} authentic cultural celebrations</strong> happening in <strong>{cityFilter}</strong>:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setCategoryFilter('All')}
                className="px-4 py-2 text-xs font-semibold bg-heritage-maroon hover:bg-heritage-darkMaroon text-white rounded-full shadow-sm transition-all"
              >
                View All in {cityFilter}
              </button>
              <button
                onClick={() => setCityFilter('All')}
                className="px-4 py-2 text-xs font-semibold bg-white hover:bg-heritage-cream text-heritage-maroon rounded-full border border-heritage-gold/40 shadow-xs transition-all"
              >
                Explore "{categoryFilter}" Across All India
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold bg-heritage-cream hover:bg-heritage-gold/30 text-heritage-charcoal rounded-full border border-heritage-gold/30 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cityFallbackEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-heritage-gold/40 space-y-3">
          <p className="font-serif-title text-xl font-semibold text-heritage-charcoal">No festivals match your criteria</p>
          <p className="text-xs text-heritage-charcoal/60 max-w-md mx-auto">
            Try adjusting your search keywords, clearing the city filter, or submitting a new event if it's currently missing from our calendar.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-3 px-5 py-2 text-xs font-semibold bg-heritage-cream hover:bg-heritage-maroon hover:text-white text-heritage-charcoal rounded-full border border-heritage-gold/30 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreEvents;
