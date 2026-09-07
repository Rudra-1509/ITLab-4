import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { EventItem } from '../../types';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { Card } from '../common/Card';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

export const EventCard: React.FC<{ event: EventItem }> = ({ event }) => {
  const isSoldOut = event.ticketsSold >= event.totalCapacity;

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <Card
        hoverable
        className="overflow-hidden flex flex-col h-full bg-slate-900/80 border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300"
      >
        {/* Poster Image Container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-800">
          <img
            src={
              event.imageUrl ||
              'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80'
            }
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <CategoryBadge category={event.category} />
          </div>

          <div className="absolute top-3 right-3">
            {isSoldOut ? (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                Sold Out
              </span>
            ) : (
              <StatusBadge status={event.status} />
            )}
          </div>

          {/* City Pill */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>{event.city}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
              {event.title}
            </h3>

            <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {event.description}
            </p>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{event.venue}</span>
              </div>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Starting from
              </span>
              <span className="text-lg font-extrabold text-indigo-400">
                {formatCurrency(event.basePrice)}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Select Seats →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
