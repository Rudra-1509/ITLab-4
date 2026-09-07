import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, Share2, CheckCircle2, Ticket as TicketIcon, Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { Ticket } from '../../types';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { Button } from '../common/Button';

export interface DigitalTicketProps {
  ticket: Ticket;
}

export const DigitalTicket: React.FC<DigitalTicketProps> = ({ ticket }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VALID TICKET
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Ticket
          </Button>
        </div>
      </div>

      {/* Real Digital Pass Card */}
      <div
        id="printable-ticket"
        className="rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden"
      >
        {/* Header Ribbon / Event Poster Banner */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-700 to-sky-800 p-6 sm:p-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <TicketIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-200">
                  TicketPulse Admission Pass
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {ticket.event?.title || 'Event Pass'}
              </h2>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200 block">
                Admission Status
              </span>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs tracking-wider uppercase mt-1 shadow-md">
                VALID
              </span>
            </div>
          </div>
        </div>

        {/* Primary Event Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                Date
              </span>
              <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                {ticket.event?.date ? formatDate(ticket.event.date) : 'N/A'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                Time
              </span>
              <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                {ticket.event?.startTime ? formatTime(ticket.event.startTime) : 'TBD'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                Seat Assignment
              </span>
              <p className="text-lg font-black text-indigo-400 leading-none">
                Seat {ticket.seat?.seatNumber || 'General'}
              </p>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Venue & Location
            </span>
            <p className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {ticket.event?.venue}, {ticket.event?.city}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                Ticket Holder
              </span>
              <p className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-slate-400" />
                {ticket.user?.name || 'Authorized Guest'}
              </p>
              <span className="text-[10px] text-slate-500 truncate block">
                {ticket.user?.email}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                Price Paid
              </span>
              <p className="text-base font-extrabold text-slate-100">
                {formatCurrency(ticket.price)}
              </p>
            </div>
          </div>
        </div>

        {/* Perforated Divider with Notches */}
        <div className="relative flex items-center my-1 ticket-notch-left ticket-notch-right">
          <div className="w-full border-t-2 border-dashed border-slate-800" />
        </div>

        {/* QR Code Validation Section */}
        <div className="p-6 sm:p-8 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Scan at Venue Gate
            </span>
            <p className="text-base font-mono font-bold tracking-wider text-indigo-300">
              {ticket.ticketCode}
            </p>
            <div className="text-xs text-slate-500 space-y-0.5">
              <p>Booking ID: <span className="font-mono text-slate-400">{ticket.bookingId}</span></p>
              <p>Ticket ID: <span className="font-mono text-slate-400">{ticket.id}</span></p>
            </div>
          </div>

          {/* Crisp QR Code Container */}
          <div className="p-3.5 bg-white rounded-2xl shadow-xl shrink-0 flex items-center justify-center">
            <QRCodeSVG
              value={ticket.ticketCode || ticket.id}
              size={130}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
