import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, QrCode, ArrowRight } from 'lucide-react';
import { Ticket } from '../../types';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/Badge';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { QRCodeSVG } from 'qrcode.react';

export const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  return (
    <Card
      hoverable
      className="overflow-hidden flex flex-col md:flex-row bg-slate-900 border-slate-800 hover:border-slate-700"
    >
      {/* Poster / Event Image */}
      <div className="w-full md:w-48 h-36 md:h-auto bg-slate-800 shrink-0 relative overflow-hidden">
        <img
          src={
            ticket.event?.imageUrl ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'
          }
          alt={ticket.event?.title || 'Event'}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Ticket Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-white line-clamp-1">
              {ticket.event?.title || 'Event Ticket'}
            </h3>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {ticket.ticketCode}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Date & Time</span>
              <span className="font-medium">
                {ticket.event?.date ? formatDate(ticket.event.date) : 'N/A'} •{' '}
                {ticket.event?.startTime ? formatTime(ticket.event.startTime) : ''}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Seat</span>
              <span className="font-bold text-indigo-400 text-sm">
                Seat {ticket.seat?.seatNumber || 'General'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] uppercase text-slate-500 block">Venue</span>
              <span className="truncate block">{ticket.event?.venue}, {ticket.event?.city}</span>
            </div>
          </div>
        </div>

        {/* Action and Price */}
        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Amount Paid</span>
            <span className="text-sm font-bold text-slate-100">
              {formatCurrency(ticket.price)}
            </span>
          </div>

          <Link
            to={`/tickets/${ticket.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>View Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Mini QR Preview side */}
      <div className="hidden lg:flex items-center justify-center p-5 bg-slate-950/40 border-l border-slate-800/60 shrink-0">
        <div className="p-2 bg-white rounded-xl shadow">
          <QRCodeSVG value={ticket.ticketCode} size={64} />
        </div>
      </div>
    </Card>
  );
};
