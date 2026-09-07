import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingsApi } from '../../api/bookings.api';
import { eventsApi } from '../../api/events.api';
import { Booking, EventItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { EventCard } from '../../components/events/EventCard';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const AudienceDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [bookingsRes, eventsRes] = await Promise.all([
          bookingsApi.getMyBookings(),
          eventsApi.getEvents(),
        ]);
        setBookings(bookingsRes.bookings);
        setRecommendedEvents(eventsRes.events.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const totalSpent = bookings.reduce((sum, b) => (b.status === 'CONFIRMED' ? sum + b.totalAmount : sum), 0);
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'Audience Member'}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your booked events, download digital passes, and discover live performances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/my-tickets">
            <Button variant="primary" size="sm" leftIcon={<TicketIcon className="w-4 h-4" />}>
              My Tickets
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="secondary" size="sm">
              Explore Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Confirmed Bookings"
          value={confirmedBookings.length}
          subtitle="All transactions verified"
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          subtitle="Tickets and reservations"
          icon={<TicketIcon className="w-6 h-6 text-indigo-400" />}
        />
        <StatCard
          title="Member Status"
          value="VIP Audience"
          subtitle="Priority Redis seat reservation"
          icon={<ShieldCheck className="w-6 h-6 text-sky-400" />}
        />
      </div>

      {/* Recent Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
          <Link to="/my-tickets" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
            View all tickets →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card className="p-8 text-center bg-slate-900/60 border-slate-800 text-slate-400 text-xs">
            No booking activity recorded yet.{' '}
            <Link to="/events" className="text-indigo-400 font-semibold hover:underline ml-1">
              Book your first ticket.
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.slice(0, 4).map((b) => (
              <Card key={b.id} className="p-5 bg-slate-900 border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {b.event?.title || 'Live Performance'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {b.event?.date ? formatDate(b.event.date) : 'Upcoming'} • {b.event?.venue}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500">{b.id}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-200">
                      {formatCurrency(b.totalAmount)}
                    </span>
                    <Link
                      to="/my-tickets"
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View Pass →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Recommended For You
          </h2>
          <Link to="/events" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
            See all events →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      </div>
    </div>
  );
};
