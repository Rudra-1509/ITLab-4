import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ticket, Calendar, MapPin, DollarSign, Percent, ExternalLink, RotateCcw } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { pricingApi } from '../../api/pricing.api';
import { EventItem, Seat, PricingDetails } from '../../types';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { CategoryBadge, StatusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OrganizerEventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [pricing, setPricing] = useState<PricingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (eventId: string) => {
    setIsLoading(true);
    try {
      const [evtRes, seatsRes, priceRes] = await Promise.all([
        eventsApi.getEventById(eventId),
        eventsApi.getEventSeats(eventId),
        pricingApi.getEventPrice(eventId),
      ]);
      setEvent(evtRes.event);
      setSeats(seatsRes.seats);
      setPricing(priceRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Loading event telemetry..." size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <ErrorState
        title="Event Not Found"
        message="The requested event does not exist."
        onRetry={() => id && loadData(id)}
      />
    );
  }

  const soldCount = seats.filter((s) => s.status === 'SOLD').length;
  const lockedCount = seats.filter((s) => s.status === 'LOCKED').length;
  const availableCount = seats.filter((s) => s.status === 'AVAILABLE').length;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events Table</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CategoryBadge category={event.category} />
              <StatusBadge status={event.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {event.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/events/${event.id}`} target="_blank">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Public Page
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadData(event.id)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Sold Seats"
          value={`${soldCount} / ${seats.length}`}
          subtitle={`${Math.round((soldCount / (seats.length || 1)) * 100)}% Occupancy`}
          icon={<Ticket className="w-5 h-5 text-indigo-400" />}
        />
        <StatCard
          title="Active Redis Locks"
          value={lockedCount}
          subtitle="Currently held in checkout"
          icon={<DollarSign className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          title="Available Seats"
          value={availableCount}
          subtitle="Open for immediate purchase"
          icon={<Percent className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Current Dynamic Price"
          value={formatCurrency(pricing?.current_price || event.basePrice)}
          subtitle={`Base: ${formatCurrency(event.basePrice)}`}
          icon={<DollarSign className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Live Seat Matrix Visualization */}
      <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Live Seat Occupancy Matrix</h3>
        <p className="text-xs text-slate-400">
          Visual status of all 50 generated seats for this event.
        </p>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
          {seats.map((seat) => {
            const isSold = seat.status === 'SOLD';
            const isLocked = seat.status === 'LOCKED';
            return (
              <div
                key={seat.id}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  isSold
                    ? 'bg-slate-950/80 border-slate-800 text-slate-600'
                    : isLocked
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                }`}
                title={`Seat ${seat.seatNumber}: ${seat.status}`}
              >
                <span>{seat.seatNumber}</span>
                <span className="block text-[9px] font-normal uppercase opacity-75">
                  {seat.status}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
