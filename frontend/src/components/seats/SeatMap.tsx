import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Timer, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { Seat, SeatStatus } from '../../types';
import { SeatItem } from './SeatItem';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { formatCountdown, formatCurrency } from '../../utils/formatters';

export interface SeatMapProps {
  seats: Seat[];
  onRefreshSeats: (silent?: boolean) => void | Promise<void>;
  isLoading?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, onRefreshSeats, isLoading }) => {
  const navigate = useNavigate();
  const {
    selectedSeats,
    lockSeat,
    deselectSeat,
    isLocked,
    lockSecondsRemaining,
    unitPrice,
    totalPrice,
  } = useBooking();

  const [unlockedSeatIds, setUnlockedSeatIds] = React.useState<Set<string>>(new Set());

  // Group seats by row (A, B, C, D, E...)
  const seatsByRow = useMemo(() => {
    const map = new Map<string, Seat[]>();
    for (const seat of seats) {
      if (!map.has(seat.row)) {
        map.set(seat.row, []);
      }
      map.get(seat.row)!.push(seat);
    }
    // Sort seats numerically inside each row
    map.forEach((rowSeats) => {
      rowSeats.sort((a, b) => {
        const numA = parseInt(a.seatNumber.replace(/\D/g, ''), 10);
        const numB = parseInt(b.seatNumber.replace(/\D/g, ''), 10);
        return numA - numB;
      });
    });
    return map;
  }, [seats]);

  const handleSeatClick = async (seat: Seat) => {
    const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);
    if (isAlreadySelected) {
      // Optimistically treat as available immediately to prevent any flicker
      setUnlockedSeatIds((prev) => new Set(prev).add(seat.id));
      await deselectSeat(seat.id);
      await onRefreshSeats(true);
      setUnlockedSeatIds((prev) => {
        const next = new Set(prev);
        next.delete(seat.id);
        return next;
      });
    } else {
      const ok = await lockSeat(seat);
      if (ok) {
        await onRefreshSeats(true);
      }
    }
  };

  const getSeatStatus = (seat: Seat): SeatStatus => {
    if (selectedSeats.some((s) => s.id === seat.id)) {
      return 'SELECTED';
    }
    if (unlockedSeatIds.has(seat.id)) {
      return 'AVAILABLE';
    }
    return seat.status;
  };

  return (
    <div className="space-y-6">
      {/* 5-minute Redis Lock Timer Alert Banner */}
      {isLocked && (
        <div className="bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-amber-500/20 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-amber-500/10 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Timer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-200">
                Seat locked for <span className="font-mono text-amber-300 font-extrabold text-base">{formatCountdown(lockSecondsRemaining)}</span>
              </p>
              <p className="text-xs text-amber-300/80">
                Atomic Redis lock active. Complete checkout before reservation releases.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/checkout')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Checkout ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'})
          </Button>
        </div>
      )}

      {/* Main Seat Map Arena */}
      <Card className="p-6 md:p-8 bg-slate-900/90 border-slate-800 text-center overflow-x-auto">
        {/* Stage Visualization */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative py-2.5 px-8 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-indigo-600/60 to-indigo-900/60 border border-indigo-500/40 shadow-lg shadow-indigo-500/20">
            <span className="text-xs md:text-sm font-extrabold tracking-[0.3em] uppercase text-indigo-100">
              STAGE / SCREEN
            </span>
          </div>
          <div className="h-8 bg-gradient-to-b from-indigo-500/10 to-transparent blur-sm rounded-full mx-6" />
        </div>

        {/* Rows and Seats */}
        <div className="inline-block min-w-full sm:min-w-0 space-y-3.5 pb-4">
          {Array.from(seatsByRow.entries()).map(([rowLetter, rowSeats]) => (
            <div key={rowLetter} className="flex items-center justify-center gap-2 sm:gap-3">
              {/* Row Label Left */}
              <span className="w-6 text-xs font-bold text-slate-500 select-none">
                {rowLetter}
              </span>

              {/* Seat Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {rowSeats.slice(0, 5).map((seat) => (
                  <SeatItem
                    key={seat.id}
                    seat={seat}
                    status={getSeatStatus(seat)}
                    onSelect={handleSeatClick}
                    disabled={isLoading}
                  />
                ))}

                {/* Center aisle spacing */}
                <div className="w-3 sm:w-6" />

                {rowSeats.slice(5).map((seat) => (
                  <SeatItem
                    key={seat.id}
                    seat={seat}
                    status={getSeatStatus(seat)}
                    onSelect={handleSeatClick}
                    disabled={isLoading}
                  />
                ))}
              </div>

              {/* Row Label Right */}
              <span className="w-6 text-xs font-bold text-slate-500 select-none">
                {rowLetter}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="pt-8 mt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-slate-850 border border-slate-700" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600 border border-indigo-400" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 text-[10px]">
              <Lock className="w-3 h-3" />
            </div>
            <span>Locked (5 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-[10px]">
              ✕
            </div>
            <span>Sold</span>
          </div>

          <button
            onClick={() => onRefreshSeats(false)}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium ml-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Seats
          </button>
        </div>
      </Card>

      {/* Floating Booking Summary Panel (when seats selected) */}
      {selectedSeats.length > 0 && (
        <Card className="p-5 bg-slate-900 border-indigo-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Booking Selection
            </span>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm font-semibold text-white">Selected:</span>
              {selectedSeats.map((seat) => (
                <span
                  key={seat.id}
                  className="px-2.5 py-0.5 rounded-lg bg-indigo-600/30 border border-indigo-500 text-indigo-300 font-bold text-xs"
                >
                  {seat.seatNumber}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formatCurrency(unitPrice)} × {selectedSeats.length} ={' '}
              <span className="text-indigo-300 font-bold">{formatCurrency(totalPrice)}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full md:w-auto"
            >
              Proceed to Checkout ({formatCurrency(totalPrice)})
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
