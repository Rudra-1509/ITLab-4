import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket as TicketIcon, Search } from 'lucide-react';
import { ticketsApi } from '../../api/tickets.api';
import { Ticket } from '../../types';
import { TicketCard } from '../../components/tickets/TicketCard';
import { TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/common/Button';

export const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ticketsApi.getMyTickets();
      setTickets(res.tickets);
    } catch (err: any) {
      setError('Unable to load your digital tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      t.event?.title.toLowerCase().includes(q) ||
      t.ticketCode.toLowerCase().includes(q) ||
      t.event?.venue.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <TicketIcon className="w-8 h-8 text-indigo-400" />
            My Tickets
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access, print, and view your verified admission passes and QR gate codes.
          </p>
        </div>

        <Link to="/events">
          <Button variant="primary" size="sm">
            Discover More Events
          </Button>
        </Link>
      </div>

      {/* Quick Search */}
      {tickets.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by event or ticket code..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Ticket List Body */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTickets} />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<TicketIcon className="w-8 h-8 text-indigo-400" />}
          title="You don't have any tickets yet"
          description="Browse our live catalog of concerts, theatrical performances, and sports games to book seats."
          actionLabel="Browse Events Now"
          onAction={() => window.location.assign('/events')}
        />
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};
