import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ticket as TicketIcon } from 'lucide-react';
import { ticketsApi } from '../../api/tickets.api';
import { Ticket } from '../../types';
import { DigitalTicket } from '../../components/tickets/DigitalTicket';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id]);

  const fetchTicket = async (ticketId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ticketsApi.getTicketById(ticketId);
      setTicket(res.ticket);
    } catch (err: any) {
      setError('Unable to load digital ticket details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Generating encrypted pass..." size="lg" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <ErrorState
          title="Ticket Not Found"
          message={error || 'The requested ticket could not be found or you do not own it.'}
          onRetry={() => id && fetchTicket(id)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="no-print">
        <Link
          to="/my-tickets"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Tickets</span>
        </Link>
      </div>

      <DigitalTicket ticket={ticket} />
    </div>
  );
};
