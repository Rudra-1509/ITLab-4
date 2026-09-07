import React from 'react';
import { Lock, Check } from 'lucide-react';
import { Seat, SeatStatus } from '../../types';

export interface SeatItemProps {
  seat: Seat;
  status: SeatStatus;
  onSelect: (seat: Seat) => void;
  disabled?: boolean;
}

export const SeatItem: React.FC<SeatItemProps> = ({ seat, status, onSelect, disabled }) => {
  const isAvailable = status === 'AVAILABLE';
  const isSelected = status === 'SELECTED';
  const isLocked = status === 'LOCKED';
  const isSold = status === 'SOLD';

  const handleClick = () => {
    if (!isSold && !disabled) {
      onSelect(seat);
    }
  };

  const getStyle = () => {
    if (isSelected) {
      return 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400/50 scale-105';
    }
    if (isLocked) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/50 hover:bg-amber-500/25';
    }
    if (isSold) {
      return 'bg-slate-900/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-50';
    }
    // Available
    return 'bg-slate-850 hover:bg-emerald-500/20 text-slate-200 border-slate-700 hover:border-emerald-500/60 hover:text-emerald-300 hover:shadow-md hover:shadow-emerald-500/10 cursor-pointer';
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSold || (disabled && !isSelected)}
      className={`relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center text-xs font-bold transition-all duration-150 select-none ${getStyle()}`}
      title={`Seat ${seat.seatNumber} - ${status}`}
    >
      {isSelected ? (
        <Check className="w-4 h-4 stroke-[3]" />
      ) : isLocked ? (
        <Lock className="w-3.5 h-3.5" />
      ) : isSold ? (
        <span className="text-[10px] text-slate-600">✕</span>
      ) : (
        <span className="text-[11px]">{seat.seatNumber}</span>
      )}
    </button>
  );
};
