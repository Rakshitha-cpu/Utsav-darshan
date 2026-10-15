import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Sparkles } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';

const CulturalCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-10-15')); // seeded calendar focus
  const [selectedDate, setSelectedDate] = useState(new Date('2026-10-18'));
  const [events, setEvents] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [calendarView, setCalendarView] = useState('month'); // 'month' or 'week'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evRes, cRes] = await Promise.all([
          fetch('/api/events?limit=100'),
          fetch('/api/cities')
        ]);
        const evData = await evRes.json();
        const cData = await cRes.json();
        if (evData.success) setEvents(evData.events);
        if (cData.success) setCities(cData.cities);
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextMonth = () => setCurrentDate(calendarView === 'month' ? addMonths(currentDate, 1) : new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
  const prevMonth = () => setCurrentDate(calendarView === 'month' ? subMonths(currentDate, 1) : new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));

  // Calendar dates generation (Monthly or Weekly)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = calendarView === 'month' 
    ? startOfWeek(monthStart, { weekStartsOn: 0 }) 
    : startOfWeek(currentDate, { weekStartsOn: 0 });
  const endDate = calendarView === 'month' 
    ? endOfWeek(monthEnd, { weekStartsOn: 0 }) 
    : endOfWeek(currentDate, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter events based on user selection
  const filteredEvents = events.filter((ev) => {
    if (selectedCity !== 'All' && ev.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (selectedCategory !== 'All' && ev.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    return true;
  });

  // Helper: Find events occurring on a particular date
  const getEventsForDay = (day) => {
    return filteredEvents.filter((ev) => {
      const s = new Date(ev.startDate);
      const e = new Date(ev.endDate);
      // Normalize times for date boundary comparison
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);
      return day >= s && day <= e;
    });
  };

  const selectedDateEvents = getEventsForDay(selectedDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-heritage-maroon">
            Cultural Calendar & Tithi Timetable
          </h1>
          <p className="text-sm text-heritage-charcoal/70 mt-1">
            Browse auspicious dates, multi-day celebrations, and temple melas across India.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-heritage-gold/30 bg-white font-medium focus:outline-none"
          >
            <option value="All">All Cities</option>
            {cities.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-heritage-gold/30 bg-white font-medium focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Temple & Spiritual">Temple & Spiritual</option>
            <option value="Cultural Festivals">Cultural Festivals</option>
            <option value="Traditional Music & Dance">Music & Dance</option>
            <option value="Folk & Jatras">Folk & Jatras</option>
          </select>

          {/* Calendar View Toggle: Month vs Week */}
          <div className="flex border border-heritage-gold/30 rounded-lg overflow-hidden bg-white text-xs font-semibold">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 transition-colors ${calendarView === 'month' ? 'bg-heritage-maroon text-white' : 'text-heritage-charcoal hover:bg-heritage-cream'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1.5 transition-colors ${calendarView === 'week' ? 'bg-heritage-maroon text-white' : 'text-heritage-charcoal hover:bg-heritage-cream'}`}
            >
              Weekly
            </button>
          </div>

          {/* Print/Download Cultural Calendar Button */}
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-semibold bg-heritage-cream hover:bg-heritage-gold/30 text-heritage-maroon rounded-lg border border-heritage-gold/30 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Print or Save PDF of City Festival Calendar"
          >
            <span>🖨️ Print City Calendar</span>
          </button>
        </div>
      </div>

      {/* Main Calendar + Selected Day Events Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Month/Week View (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-heritage-gold/30 shadow-sm space-y-6">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-heritage-gold/20">
            <h2 className="font-serif-title text-2xl font-bold text-heritage-maroon">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-heritage-cream text-heritage-charcoal transition-colors border border-heritage-gold/20"
                title="Previous Interval"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-heritage-cream text-heritage-maroon hover:bg-heritage-maroon hover:text-white transition-colors border border-heritage-gold/30"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-heritage-cream text-heritage-charcoal transition-colors border border-heritage-gold/20"
                title="Next Interval"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-heritage-mutedGold uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[70px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-heritage-saffron/20 border-heritage-maroon ring-2 ring-heritage-maroon/20'
                      : isCurrentMonth
                      ? 'bg-heritage-ivory/50 border-heritage-gold/20 hover:border-heritage-saffron/60'
                      : 'bg-neutral-50/50 border-transparent text-neutral-400 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isSelected ? 'text-heritage-maroon font-bold' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {hasEvents && (
                      <span className="w-2 h-2 rounded-full bg-heritage-deepSaffron" />
                    )}
                  </div>

                  {/* Tiny Event badges on date */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 1).map((ev) => (
                      <div
                        key={ev._id}
                        className="text-[9px] font-semibold text-heritage-maroon bg-white/90 px-1 py-0.5 rounded truncate border border-heritage-gold/30 shadow-xs"
                      >
                        {ev.name}
                      </div>
                    ))}
                    {dayEvents.length > 1 && (
                      <div className="text-[8px] text-heritage-mutedGold font-semibold text-right">
                        +{dayEvents.length - 1} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Drawer (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-heritage-gold/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-heritage-gold/20">
              <div className="flex items-center gap-2 text-heritage-maroon">
                <CalendarIcon className="w-5 h-5 text-heritage-saffron" />
                <h3 className="font-serif-title text-xl font-bold">
                  {format(selectedDate, 'EEEE, MMM dd')}
                </h3>
              </div>
              <span className="text-xs font-semibold text-heritage-mutedGold bg-heritage-cream px-2 py-0.5 rounded-full">
                {selectedDateEvents.length} Events
              </span>
            </div>

            <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-3.5 rounded-2xl bg-heritage-cream/40 border border-heritage-gold/20 hover:border-heritage-maroon transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className="text-heritage-deepSaffron uppercase tracking-wider">
                        {ev.category}
                      </span>
                      <span className="text-heritage-charcoal/60">
                        {ev.city}
                      </span>
                    </div>

                    <h4 className="font-serif-title text-base font-bold text-heritage-charcoal hover:text-heritage-maroon">
                      <Link to={`/events/${ev.slug || ev._id}`}>{ev.name}</Link>
                    </h4>

                    <div className="flex items-center text-xs text-heritage-charcoal/70 gap-1">
                      <MapPin className="w-3.5 h-3.5 text-heritage-mutedGold shrink-0" />
                      <span className="truncate">{ev.venue?.name}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-heritage-gold/20 text-xs">
                      <span className="text-[11px] text-heritage-charcoal/60">
                        {ev.startTime} - {ev.endTime}
                      </span>
                      <Link
                        to={`/events/${ev.slug || ev._id}`}
                        className="text-xs font-semibold text-heritage-maroon hover:underline"
                      >
                        Read Story →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-heritage-charcoal/60 space-y-2">
                  <Sparkles className="w-6 h-6 mx-auto text-heritage-mutedGold opacity-50" />
                  <p className="text-xs">No celebrations listed for this date.</p>
                  <p className="text-[11px] text-heritage-charcoal/50">
                    Click another date on the calendar or submit a celebration.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-heritage-gold/20 text-center">
            <Link
              to="/submit"
              className="text-xs font-semibold text-heritage-maroon hover:text-heritage-darkMaroon"
            >
              Know an event on this day? Add it now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalCalendar;
