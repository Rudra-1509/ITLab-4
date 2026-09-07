import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Calendar, Clock, MapPin, DollarSign, Image, Sparkles } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { EventCategory } from '../../types';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('CONCERT');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Boston');
  const [date, setDate] = useState('2026-10-25');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('22:00');
  const [basePrice, setBasePrice] = useState('1000');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !venue || !city || !date || !basePrice) {
      showToast('Please fill out all required event fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedDate = new Date(date).toISOString();
      await eventsApi.createEvent({
        title,
        description,
        category,
        venue,
        city,
        date: parsedDate,
        startTime,
        endTime,
        basePrice: parseFloat(basePrice),
        imageUrl: imageUrl || undefined,
        totalCapacity: 50,
      });

      showToast('Event created successfully with 50 auto-generated seats!', 'success');
      navigate('/organizer/events');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to create event.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Events</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Create New Event</h1>
        <p className="text-xs text-slate-400 mt-1">
          Publish a new experience. Seats (Rows A-E, 1-10) and dynamic pricing rules will be automatically provisioned.
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-slate-900 border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Event Title"
            placeholder="e.g. Midnight Jazz & Blues Festival"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the experience, performers, atmosphere..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="CONCERT">🎵 Concert</option>
                <option value="THEATER">🎭 Theater</option>
                <option value="SPORTS">⚽ Sports</option>
              </select>
            </div>

            {/* Base Price */}
            <Input
              label="Starting Base Price (₹)"
              type="number"
              placeholder="1000"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              leftIcon={<DollarSign className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Venue Name"
              placeholder="e.g. University Grand Auditorium"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />

            <Input
              label="City"
              placeholder="e.g. Boston"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
              required
            />

            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
              required
            />

            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
              required
            />
          </div>

          <Input
            label="Cover Poster Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            leftIcon={<Image className="w-4 h-4" />}
            helperText="Direct image link for event card and banner."
          />

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Link to="/organizer/events">
              <Button variant="ghost" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Publish Event
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
