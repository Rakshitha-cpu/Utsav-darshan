import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const EventCard = ({ event }) => {
  const formattedStartDate = event.startDate ? format(new Date(event.startDate), 'MMM dd, yyyy') : '';
  const formattedEndDate = event.endDate ? format(new Date(event.endDate), 'MMM dd, yyyy') : '';
  const isMultiDay = formattedStartDate !== formattedEndDate;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-heritage-gold/20 flex flex-col h-full hover:-translate-y-1">
      {/* Cover Image & Badges */}
      <div className="relative h-52 overflow-hidden bg-heritage-cream">
        <img
          src={event.images?.cover || 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80'}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Verification Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {event.isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur-sm shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified Event
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-600/90 text-white backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Reviewed
            </span>
          )}
          {event.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-heritage-maroon/90 text-heritage-gold backdrop-blur-sm shadow-sm">
              ★ Featured
            </span>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-heritage-ivory/90 text-heritage-maroon backdrop-blur-sm">
            {event.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Time */}
          <div className="flex items-center text-xs font-semibold text-heritage-deepSaffron mb-2 gap-1.5">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {formattedStartDate} {isMultiDay && `— ${formattedEndDate}`}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="font-serif-title text-xl font-bold text-heritage-charcoal group-hover:text-heritage-maroon transition-colors line-clamp-1">
            {event.name}
          </h3>

          {/* Venue & City */}
          <div className="flex items-center text-xs text-heritage-charcoal/70 mt-2 gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-heritage-mutedGold shrink-0" />
            <span className="truncate">{event.venue?.name}, {event.city}</span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-heritage-charcoal/80 mt-3 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Action Link */}
        <div className="pt-4 mt-4 border-t border-heritage-gold/20 flex items-center justify-between">
          <span className="text-xs font-medium text-heritage-mutedGold group-hover:text-heritage-maroon transition-colors">
            Explore Cultural Story →
          </span>
          <Link
            to={`/events/${event.slug || event._id}`}
            className="text-xs font-semibold bg-heritage-cream hover:bg-heritage-maroon hover:text-white px-3.5 py-1.5 rounded-full transition-colors text-heritage-charcoal border border-heritage-gold/30"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
