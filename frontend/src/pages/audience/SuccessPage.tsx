import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Ticket as TicketIcon,
  QrCode,
  Calendar,
  MapPin,
  ArrowRight,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { QRCodeSVG } from 'qrcode.react';

export const SuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    bookingId?: string;
    event?: any;
    seats?: any[];
    totalPaid?: number;
    tickets?: any[];
  } | null;

  const [copied, setCopied] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti on mount!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const bId = bookingId || state?.bookingId || 'BOOK-DEMO-9918';
  const event = state?.event;
  const seats = state?.seats || [];
  const totalPaid = state?.totalPaid || 2400;
  const ticketId = state?.tickets?.[0]?.ticket_id || 'tkt-001-alpha';
  const qrValue = state?.tickets?.[0]?.ticket_code || bId;

  const handleCopyId = () => {
    navigator.clipboard.writeText(bId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Confirmation Hero Card */}
      <Card className="p-8 sm:p-10 bg-slate-900 border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Checkmark icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            Payment Confirmed
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your admission tickets have been generated with digital QR security passes.
          </p>
        </div>

        {/* Booking ID badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <span className="text-slate-500">Booking Reference:</span>
          <span className="font-mono font-bold text-slate-200">{bId}</span>
          <button
            onClick={handleCopyId}
            className="text-slate-400 hover:text-white transition-colors ml-1 p-1 rounded hover:bg-slate-800"
            title="Copy reference code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Booking Details Breakdown Card */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left space-y-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
              Event Title
            </span>
            <h4 className="text-base font-bold text-white">
              {event?.title || 'Grand Symphony Orchestra'}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                Date & Venue
              </span>
              <p className="text-slate-300 font-medium">
                {event?.date ? formatDate(event.date) : 'Upcoming'} • {event?.venue || 'Auditorium'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                Assigned Seats
              </span>
              <div className="flex flex-wrap gap-1">
                {seats.length > 0 ? (
                  seats.map((s: any) => (
                    <span
                      key={s.id || s.seatNumber}
                      className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30"
                    >
                      Seat {s.seatNumber}
                    </span>
                  ))
                ) : (
                  <span className="text-indigo-300 font-bold">Seat A1</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-400">Total Paid</span>
            <span className="font-extrabold text-emerald-400 text-base">
              {formatCurrency(totalPaid)}
            </span>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to={`/tickets/${ticketId}`} className="w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                leftIcon={<TicketIcon className="w-4 h-4" />}
              >
                View Digital Ticket
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="md"
              className="w-full justify-center"
              onClick={() => setIsQRModalOpen(true)}
              leftIcon={<QrCode className="w-4 h-4" />}
            >
              Download / Show QR
            </Button>
          </div>

          <Link to="/events" className="block pt-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              Back to Events Catalog
            </Button>
          </Link>
        </div>
      </Card>

      {/* QR Code Modal Dialog */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="Gate Admission QR Pass"
      >
        <div className="p-4 text-center space-y-4">
          <p className="text-xs text-slate-400">
            Present this QR code to the turnstile scanner at the venue entrance.
          </p>

          <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl mx-auto">
            <QRCodeSVG value={qrValue} size={180} level="H" />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-indigo-300">{qrValue}</span>
            <p className="text-[11px] text-slate-500">
              Valid for {seats.length || 1} attendee admission
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.print();
            }}
            className="w-full mt-2"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Save or Print QR
          </Button>
        </div>
      </Modal>
    </div>
  );
};
