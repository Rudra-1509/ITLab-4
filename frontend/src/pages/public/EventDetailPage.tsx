import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Ticket,
  ChevronDown,
  ShieldCheck,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { pricingApi } from '../../api/pricing.api';
import { EventItem, Seat, PricingDetails } from '../../types';
import { CategoryBadge, StatusBadge } from '../../components/common/Badge';
import { PricingBreakdown } from '../../components/events/PricingBreakdown';
import { SeatMap } from '../../components/seats/SeatMap';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/common/Button';
import { useBooking } from '../../context/BookingContext';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const seatMapRef = useRef<HTMLDivElement>(null);

  const { setSelectedEvent, loadPricing, pricing, setLockExpiredCallback } = useBooking();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEventData(id);
    }
  }, [id]);

  const fetchEventData = async (eventId: string) => {
    setIsLoadingEvent(true);
    setError(null);
    try {
      const [eventRes, seatsRes] = await Promise.all([
        eventsApi.getEventById(eventId),
        eventsApi.getEventSeats(eventId),
      ]);

      setEvent(eventRes.event);
      setSeats(seatsRes.seats);
      setSelectedEvent(eventRes.event);

      // Load pricing for dynamic calculations
      await loadPricing(eventId);

      // Register callback to refresh seats when Redis lock countdown expires
      setLockExpiredCallback(() => {
        refreshSeats(eventId);
      });
    } catch (err: any) {
      setError('Unable to load event details. Please try again.');
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const refreshSeats = async (eventId?: string) => {
    const targetId = eventId || id;
    if (!targetId) return;
    setIsLoadingSeats(true);
    try {
      const res = await eventsApi.getEventSeats(targetId);
      setSeats(res.seats);
      await loadPricing(targetId);
    } catch (err) {
      console.error('Failed to refresh seats:', err);
    } finally {
      setIsLoadingSeats(false);
    }
  };

  const scrollToSeatMap = () => {
    seatMapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoadingEvent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading event & live seat inventory..." size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Event Not Found"
          message={error || "We couldn't retrieve the event you requested."}
          onRetry={() => id && fetchEventData(id)}
        />
      </div>
    );
  }

  const availableSeatsCount = seats.filter((s) => s.status === 'AVAILABLE').length;

  return (
    <div className="space-y-12 pb-24">
      {/* Event Hero Banner */}
      <section className="relative w-full h-[360px] sm:h-[460px] bg-slate-900 overflow-hidden">
        <img
          src={
            event.imageUrl ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600'
          }
          alt={event.title}
          className="w-full h-full object-cover opacity-35 filter blur-[1px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <CategoryBadge category={event.category} />
                <StatusBadge status={event.status} />
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>{event.venue}, {event.city}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToSeatMap}
                rightIcon={<ChevronDown className="w-4 h-4" />}
                className="shadow-2xl shadow-indigo-600/40 text-base"
              >
                Select Seats
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Details & Dynamic Pricing Breakdown Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Description, Organizer, Key Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">About the Event</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[10px] block">
                    Organizer
                  </span>
                  <span className="font-medium text-slate-200 flex items-center gap-1 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                    {event.organizer?.name || 'Verified Partner'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[10px] block">
                    Available Seats
                  </span>
                  <span className="font-extrabold text-emerald-400 text-sm block mt-0.5">
                    {availableSeatsCount} / {event.totalCapacity} left
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[10px] block">
                    Starting Price
                  </span>
                  <span className="font-extrabold text-slate-100 text-sm block mt-0.5">
                    {formatCurrency(event.basePrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Guarantees */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-4 text-xs text-slate-400">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200">Guaranteed Genuine Pass: </span>
                Every ticket is encrypted with a unique QR code verified instantly by the venue gate scanner.
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Pricing Explanation */}
          <div className="lg:col-span-1">
            {pricing ? (
              <PricingBreakdown pricing={pricing} />
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse h-48" />
            )}
          </div>
        </div>
      </section>

      {/* Seat Selection Arena */}
      <section ref={seatMapRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-6 h-6 text-indigo-400" />
              Select Your Seats
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click any available seat to lock it for 5 minutes with atomic concurrency protection.
            </p>
          </div>
        </div>

        <SeatMap
          seats={seats}
          onRefreshSeats={() => refreshSeats(event.id)}
          isLoading={isLoadingSeats}
        />
      </section>
    </div>
  );
};
