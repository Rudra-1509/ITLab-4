import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EventItem, Seat, PricingDetails } from '../types';
import { bookingsApi } from '../api/bookings.api';
import { pricingApi } from '../api/pricing.api';
import { useToast } from './ToastContext';

interface BookingContextType {
  selectedEvent: EventItem | null;
  setSelectedEvent: (event: EventItem | null) => void;
  pricing: PricingDetails | null;
  loadPricing: (eventId: string) => Promise<void>;
  selectedSeats: Seat[];
  lockSecondsRemaining: number;
  isLocked: boolean;
  lockSeat: (seat: Seat) => Promise<boolean>;
  deselectSeat: (seatId: string) => Promise<boolean>;
  clearSelection: () => Promise<void>;
  setLockExpiredCallback: (cb: () => void) => void;
  unitPrice: number;
  totalPrice: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [pricing, setPricing] = useState<PricingDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [lockSecondsRemaining, setLockSecondsRemaining] = useState<number>(0);
  const [lockExpiresAt, setLockExpiresAt] = useState<number | null>(null);
  const [lockExpiredCallback, setLockExpiredCallbackState] = useState<(() => void) | null>(null);
  const { showToast } = useToast();

  const loadPricing = useCallback(async (eventId: string) => {
    try {
      const data = await pricingApi.getEventPrice(eventId);
      setPricing(data);
    } catch (err) {
      console.warn('[BookingContext] Failed to load dynamic pricing:', err);
    }
  }, []);

  const setLockExpiredCallback = useCallback((cb: () => void) => {
    setLockExpiredCallbackState(() => cb);
  }, []);

  const clearSelection = useCallback(async () => {
    if (selectedEvent && selectedSeats.length > 0) {
      try {
        await Promise.allSettled(
          selectedSeats.map((s) =>
            bookingsApi.unlockSeat({
              eventId: selectedEvent.id,
              seatId: s.id,
            })
          )
        );
      } catch (err) {
        console.warn('[BookingContext] Failed to release locks during clearSelection:', err);
      }
    }
    setSelectedSeats([]);
    setLockExpiresAt(null);
    setLockSecondsRemaining(0);
  }, [selectedEvent, selectedSeats]);

  // Countdown timer: updates every 1000ms
  useEffect(() => {
    if (!lockExpiresAt) {
      setLockSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockExpiresAt - Date.now()) / 1000));
      setLockSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        showToast('Your seat lock has expired. Seat availability has been refreshed.', 'warning');
        clearSelection();
        if (lockExpiredCallback) {
          lockExpiredCallback();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt, lockExpiredCallback, clearSelection, showToast]);

  const deselectSeat = async (seatId: string): Promise<boolean> => {
    const targetSeat = selectedSeats.find((s) => s.id === seatId);

    // Optimistically update local selected seats state
    setSelectedSeats((prev) => {
      const next = prev.filter((s) => s.id !== seatId);
      if (next.length === 0) {
        setLockExpiresAt(null);
        setLockSecondsRemaining(0);
      }
      return next;
    });

    if (selectedEvent) {
      try {
        await bookingsApi.unlockSeat({
          eventId: selectedEvent.id,
          seatId: seatId,
        });
        if (targetSeat) {
          showToast(`Seat ${targetSeat.seatNumber} unlocked.`, 'info');
        }
        return true;
      } catch (err) {
        console.warn('[BookingContext] Failed to unlock seat on server:', err);
      }
    }
    return true;
  };

  const lockSeat = async (seat: Seat): Promise<boolean> => {
    if (!selectedEvent) {
      showToast('Please select an event first.', 'error');
      return false;
    }

    // Check if already selected -> deselect
    if (selectedSeats.some((s) => s.id === seat.id)) {
      await deselectSeat(seat.id);
      return false;
    }

    try {
      // Call Redis atomic lock endpoint
      const response = await bookingsApi.lockSeat({
        eventId: selectedEvent.id,
        seatId: seat.id,
      });

      const ttlSeconds = response.lock?.expiresInSeconds || 300;
      const expiresAt = Date.now() + ttlSeconds * 1000;

      // Update seat with SELECTED status
      const updatedSeat: Seat = { ...seat, status: 'SELECTED' };
      setSelectedSeats((prev) => [...prev, updatedSeat]);
      setLockExpiresAt(expiresAt);
      setLockSecondsRemaining(ttlSeconds);

      showToast(`Seat ${seat.seatNumber} locked for 5 minutes!`, 'success');
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'This seat is currently locked or sold.';
      showToast(msg, 'error');
      return false;
    }
  };

  const unitPrice = pricing?.current_price || selectedEvent?.basePrice || 0;
  const totalPrice = unitPrice * selectedSeats.length;

  return (
    <BookingContext.Provider
      value={{
        selectedEvent,
        setSelectedEvent,
        pricing,
        loadPricing,
        selectedSeats,
        lockSecondsRemaining,
        isLocked: selectedSeats.length > 0 && lockSecondsRemaining > 0,
        lockSeat,
        deselectSeat,
        clearSelection,
        setLockExpiredCallback,
        unitPrice,
        totalPrice,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
