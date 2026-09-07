import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Trash2, Eye, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { EventItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CategoryBadge, StatusBadge } from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OrganizerEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await eventsApi.getEvents();
      setEvents(res.events);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEvent = async (eventId: string, title: string) => {
    if (window.confirm(`Are you sure you want to cancel "${title}"?`)) {
      try {
        await eventsApi.deleteEvent(eventId);
        showToast(`Event "${title}" has been cancelled.`, 'info');
        fetchEvents();
      } catch (err) {
        showToast('Failed to cancel event.', 'error');
      }
    }
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Manage Events</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, monitor, and update listings across concerts, theater, and sports.
          </p>
        </div>

        <Link to="/organizer/events/create">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter your events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Events Table / Card List */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No events found"
          description="You haven't listed any events or none match your search."
          actionLabel="Create Event"
          onAction={() => window.location.assign('/organizer/events/create')}
        />
      ) : (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Tickets</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-white max-w-[200px] truncate">
                      {evt.title}
                    </td>
                    <td className="py-4 px-4">
                      <CategoryBadge category={evt.category} />
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {formatDate(evt.date)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-200">{evt.ticketsSold}</span>
                      <span className="text-slate-500">/{evt.totalCapacity}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-200">
                      {formatCurrency(evt.basePrice)}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={evt.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/organizer/events/${evt.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          title="View Live Event Dashboard"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {evt.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancelEvent(evt.id, evt.title)}
                            className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 transition-colors"
                            title="Cancel Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
