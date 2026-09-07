import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Timer,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingsApi } from '../../api/bookings.api';
import { ticketsApi } from '../../api/tickets.api';
import { notificationsApi } from '../../api/notifications.api';
import { formatCurrency, formatDate, formatTime, formatCountdown } from '../../utils/formatters';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CategoryBadge } from '../../components/common/Badge';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    selectedEvent,
    selectedSeats,
    pricing,
    unitPrice,
    totalPrice,
    lockSecondsRemaining,
    isLocked,
    clearSelection,
  } = useBooking();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'failed'>('idle');

  // If user refreshed or has no seats selected
  if (!selectedEvent || selectedSeats.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white">No active checkout session</h2>
        <p className="text-xs text-slate-400">
          You have not selected or locked any seats yet. Please browse available events to select seats.
        </p>
        <Link to="/events">
          <Button variant="primary" size="md">
            Browse Events
          </Button>
        </Link>
      </div>
    );
  }

  // Fees calculation: 5% university convenience fee
  const bookingFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + bookingFee;

  const handleSimulatePayment = async (success: boolean) => {
    setIsProcessing(true);
    setPaymentStatus('idle');

    try {
      // Step 1: Create booking
      const createRes = await bookingsApi.createBooking({
        eventId: selectedEvent.id,
        seatIds: selectedSeats.map((s) => s.id),
      });

      const bookingId = createRes.booking_id;

      // Step 2: Simulate payment
      const simRes = await bookingsApi.simulatePayment(bookingId, { success });

      if (success && simRes.status === 'CONFIRMED') {
        showToast('Payment successful! Booking confirmed.', 'success');

        // Add mock tickets if offline fallback
        if (simRes.tickets) {
          for (const t of simRes.tickets) {
            ticketsApi.addMockTicket({
              id: t.ticket_id,
              bookingId,
              userId: user?.id || 'usr-demo-audience-01',
              eventId: selectedEvent.id,
              seatId: selectedSeats[0]?.id || 'seat-1',
              ticketCode: t.ticket_code,
              qrCode: t.qr_code,
              price: unitPrice,
              status: 'VALID',
              createdAt: new Date().toISOString(),
              event: selectedEvent,
              seat: selectedSeats[0],
              user: user || undefined,
            });
          }
        }

        notificationsApi.addMockNotification(
          '🎟 Booking Confirmed',
          `Your tickets for ${selectedEvent.title} have been confirmed!`,
          'BOOKING_CONFIRMED'
        );

        clearSelection();
        navigate(`/booking/success/${bookingId}`, {
          state: {
            bookingId,
            event: selectedEvent,
            seats: selectedSeats,
            totalPaid: grandTotal,
            tickets: simRes.tickets,
          },
        });
      } else {
        // Payment Failed simulation
        setPaymentStatus('failed');
        showToast('Payment was simulated as failed. Reserved seat locks have been released.', 'error');
        clearSelection();
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error?.message || 'Payment simulation encounter an error.';
      showToast(msg, 'error');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/events/${selectedEvent.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event & Seat Selection</span>
        </Link>
      </div>

      {/* Lock countdown indicator */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Seats locked via Redis:</span>
            <span className="font-mono text-sm font-extrabold text-amber-200">
              {formatCountdown(lockSecondsRemaining)}
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">Reservation releases on timeout</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Event & Order Breakdown */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-slate-900 border-slate-800 space-y-5">
            <div className="flex items-start gap-4">
              <img
                src={
                  selectedEvent.imageUrl ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'
                }
                alt={selectedEvent.title}
                className="w-24 h-24 rounded-xl object-cover bg-slate-800 shrink-0"
              />
              <div className="space-y-1.5">
                <CategoryBadge category={selectedEvent.category} />
                <h3 className="text-lg font-bold text-white">{selectedEvent.title}</h3>
                <div className="text-xs text-slate-400 space-y-0.5">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {formatDate(selectedEvent.date)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {selectedEvent.venue}, {selectedEvent.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Seats summary */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider block mb-2">
                Selected Seats ({selectedSeats.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-xs font-bold text-indigo-300 flex items-center gap-1.5"
                  >
                    <span>Seat {seat.seatNumber}</span>
                    <span className="text-slate-500 font-normal">({formatCurrency(unitPrice)})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price calculation summary */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Price per seat (Dynamic Rate)</span>
                <span className="text-slate-200 font-semibold">{formatCurrency(unitPrice)}</span>
              </div>
              {pricing && pricing.current_price > pricing.base_price && (
                <div className="flex justify-between text-amber-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Dynamic Surge Adjustment
                  </span>
                  <span>+{formatCurrency(pricing.current_price - pricing.base_price)}/seat</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Seats Subtotal ({selectedSeats.length} × {formatCurrency(unitPrice)})</span>
                <span className="text-slate-200 font-semibold">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>University Platform Fee (5%)</span>
                <span className="text-slate-200 font-semibold">{formatCurrency(bookingFee)}</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
                <span>Total Amount Due</span>
                <span className="text-indigo-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Payment Simulation Box */}
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 border-slate-800 space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block mb-1">
                Demo Payment Gateway
              </span>
              <h4 className="text-base font-bold text-white">Payment Simulation</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                As per system design specifications, real merchant gateways are omitted. Simulate transaction states below:
              </p>
            </div>

            {paymentStatus === 'failed' && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Simulation: Payment Failed</span>
                </div>
                <p>Transaction failed. Redis seat lock has been released back to availability.</p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button
                variant="success"
                size="lg"
                className="w-full justify-center shadow-lg shadow-emerald-600/20"
                isLoading={isProcessing}
                onClick={() => handleSimulatePayment(true)}
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
              >
                Simulate Successful Payment
              </Button>

              <Button
                variant="danger"
                size="md"
                className="w-full justify-center shadow-lg shadow-rose-600/20"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment(false)}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Simulate Failed Payment
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct integration with Booking Microservice transaction flow.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
