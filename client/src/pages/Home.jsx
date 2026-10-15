import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Sparkles, Flame, Music, Sun, Palette, Utensils, ArrowRight, ShieldCheck } from 'lucide-react';
import EventCard from '../components/EventCard';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch featured events
        const featuredRes = await fetch('/api/events/featured');
        const featuredData = await featuredRes.json();
        if (featuredData.success) {
          setFeaturedEvents(featuredData.events);
        }

        // Fetch upcoming events near selected city
        const upcomingRes = await fetch(`/api/events?city=${selectedCity}&limit=6`);
        const upcomingData = await upcomingRes.json();
        if (upcomingData.success) {
          setUpcomingEvents(upcomingData.events);
        }

        // Fetch cities list
        const citiesRes = await fetch('/api/cities');
        const citiesData = await citiesRes.json();
        if (citiesData.success) {
          setCities(citiesData.cities);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim() || selectedCity) {
      navigate(`/explore?search=${encodeURIComponent(searchKeyword)}&city=${encodeURIComponent(selectedCity)}`);
    }
  };

  const categories = [
    { name: 'Temple & Spiritual', icon: Flame, desc: 'Rathotsavas, Sacred Jatras & Sanctum rituals' },
    { name: 'Cultural Festivals', icon: Sparkles, desc: 'Dasara, Durga Puja, Onam & Heritage galas' },
    { name: 'Traditional Music & Dance', icon: Music, desc: 'Carnatic, Hindustani, Kathakali & Yakshagana' },
    { name: 'Folk & Jatras', icon: Sun, desc: 'Kambala races, Pili Nalike & Village melas' },
    { name: 'Art & Handicrafts', icon: Palette, desc: 'Chitra Santhe, Mysore silk & Handlooms' },
    { name: 'Cuisine & Food Fairs', icon: Utensils, desc: 'Sadyas, Prasada banquets & Regional feasts' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center bg-heritage-cream py-24 overflow-hidden border-b border-heritage-gold/30">
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1920&q=80"
            alt="Mysuru Dasara Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-heritage-saffron/15 border border-heritage-saffron/30 text-heritage-maroon text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-heritage-deepSaffron" />
            Discover The Living Heritage of India
          </div>

          <h1 className="font-serif-title text-4xl sm:text-6xl font-extrabold text-heritage-maroon tracking-tight leading-tight">
            Discover the Festivals That Bring India to Life.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-heritage-charcoal/80 leading-relaxed font-light">
            From the grand illumination of Mysuru Dasara to the midnight mysticism of Bengaluru Karaga and the coastal thunder of Kambala. Explore verified cultural dates, sacred temple melas, and regional traditions.
          </p>

          {/* Prominent Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-white p-3 rounded-2xl shadow-xl border-2 border-heritage-gold/30 flex flex-col md:flex-row gap-3 items-center"
          >
            {/* City Selector */}
            <div className="flex items-center w-full md:w-1/3 px-3 py-2 border-b md:border-b-0 md:border-r border-heritage-gold/20">
              <MapPin className="w-5 h-5 text-heritage-saffron shrink-0 mr-2" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-heritage-charcoal focus:outline-none cursor-pointer"
              >
                <option value="All">All Cities (India)</option>
                {cities.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Keyword Input */}
            <div className="flex items-center w-full md:flex-1 px-3 py-2">
              <Search className="w-5 h-5 text-heritage-mutedGold shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search festival, classical dance, jatra..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-transparent text-sm text-heritage-charcoal placeholder-heritage-charcoal/50 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3 rounded-xl bg-heritage-maroon hover:bg-heritage-darkMaroon text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg shrink-0"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick city tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-heritage-charcoal/70">
            <span className="font-semibold text-heritage-mutedGold">Popular Hubs:</span>
            {['Bengaluru', 'Mysuru', 'Mangaluru', 'Chennai', 'Kolkata', 'Jaipur', 'Mumbai', 'Kochi'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  selectedCity === city
                    ? 'bg-heritage-maroon text-white font-semibold'
                    : 'bg-white/80 hover:bg-white text-heritage-charcoal border border-heritage-gold/20'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Featured Festivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-3 border-b border-heritage-gold/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-heritage-deepSaffron">
              <Sparkles className="w-4 h-4" />
              Signature Indian Celebrations
            </div>
            <h2 className="font-serif-title text-3xl font-bold text-heritage-maroon mt-1">
              Featured Cultural Festivals
            </h2>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-heritage-maroon hover:text-heritage-deepSaffron flex items-center gap-1 mt-2 sm:mt-0">
            View All Discoveries →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredEvents.slice(0, 3).map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </section>

      {/* 3. Browse by Cultural Category */}
      <section className="bg-heritage-cream/60 py-16 border-y border-heritage-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif-title text-3xl font-bold text-heritage-maroon">
              Immerse in Living Traditions
            </h2>
            <p className="text-sm text-heritage-charcoal/70 mt-2">
              Select a cultural theme to discover authentic processions, temple rituals, and artistic expressions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/explore?category=${encodeURIComponent(cat.name)}`}
                  className="bg-white p-6 rounded-2xl border border-heritage-gold/20 shadow-sm hover:shadow-md hover:border-heritage-saffron transition-all group flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-heritage-cream group-hover:bg-heritage-saffron/20 flex items-center justify-center text-heritage-maroon shrink-0 transition-colors">
                    <IconComp className="w-6 h-6 text-heritage-deepSaffron" />
                  </div>
                  <div>
                    <h3 className="font-serif-title text-lg font-bold text-heritage-charcoal group-hover:text-heritage-maroon transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-heritage-charcoal/70 mt-1 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Upcoming in Selected City */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-3 border-b border-heritage-gold/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-heritage-deepSaffron">
              <MapPin className="w-4 h-4" />
              Regional Calendar Highlights
            </div>
            <h2 className="font-serif-title text-3xl font-bold text-heritage-maroon mt-1">
              Upcoming Celebrations in {selectedCity}
            </h2>
          </div>
          <Link
            to={`/explore?city=${encodeURIComponent(selectedCity)}`}
            className="text-sm font-semibold text-heritage-maroon hover:text-heritage-deepSaffron flex items-center gap-1 mt-2 sm:mt-0"
          >
            See all in {selectedCity} →
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-heritage-gold/40">
            <p className="text-sm text-heritage-charcoal/70">
              No upcoming events currently scheduled for {selectedCity}.
            </p>
            <Link
              to="/submit"
              className="inline-block mt-4 text-xs font-semibold text-heritage-maroon hover:underline"
            >
              Are you from {selectedCity}? Share a local festival listing →
            </Link>
          </div>
        )}
      </section>

      {/* 5. Cultural Storytelling Highlight: Mysuru Dasara & Bengaluru Karaga */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-heritage-maroon to-heritage-indigo text-heritage-ivory rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs uppercase tracking-widest text-heritage-gold font-bold">
              Heritage Spotlight • Karnataka
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold leading-tight">
              The Living Legend of Bengaluru Karaga Shaktyotsava
            </h2>
            <p className="text-xs sm:text-sm text-heritage-cream/90 leading-relaxed font-light">
              Dating back to the Vijayanagara epoch, the Karaga is celebrated by the Thigala community in the old Pete avenues of Bengaluru. Carrying a pyramid floral pot atop the head, the priest leads an all-night procession, paying homage at the historic Hazrat Tawakkal Mastan Dargah, demonstrating a deep tradition of interfaith harmony.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/events/bengaluru-karaga-shaktyotsava"
                className="bg-heritage-gold hover:bg-heritage-mutedGold text-heritage-darkMaroon font-semibold px-6 py-2.5 rounded-full text-xs transition-colors shadow-md"
              >
                Read Cultural Story & Timings
              </Link>
              <Link
                to="/cities/bengaluru"
                className="border border-heritage-gold/50 hover:bg-white/10 text-white font-medium px-6 py-2.5 rounded-full text-xs transition-colors"
              >
                Explore Bengaluru Heritage Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Community Submission Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-heritage-cream rounded-3xl p-10 border border-heritage-gold/30">
        <div className="w-12 h-12 rounded-full bg-heritage-saffron/20 mx-auto flex items-center justify-center text-heritage-deepSaffron mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="font-serif-title text-2xl font-bold text-heritage-maroon">
          Preserve & Celebrate Your Local Jatra
        </h3>
        <p className="text-sm text-heritage-charcoal/70 max-w-xl mx-auto mt-2 leading-relaxed">
          Does your village temple have an annual rathotsava, or does your community host a traditional music baithak? Submit the details with verifiable sources. Once reviewed by our moderation team, it will be published to the national calendar.
        </p>
        <div className="mt-6">
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 bg-heritage-maroon hover:bg-heritage-darkMaroon text-white font-medium px-6 py-3 rounded-full text-sm shadow-md transition-all hover:shadow"
          >
            <span>Contribute an Event Listing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
