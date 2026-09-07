import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Music,
  Theater,
  Trophy,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { EventItem } from '../../types';
import { EventCard } from '../../components/events/EventCard';
import { EventCardSkeleton } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsApi.getEvents();
        setEvents(data.events);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCity && selectedCity !== 'ALL') params.append('city', selectedCity);
    navigate(`/events?${params.toString()}`);
  };

  const featuredEvents = events.slice(0, 3);
  const popularEvents = [...events].sort((a, b) => b.ticketsSold - a.ticketsSold).slice(0, 4);
  const upcomingEvents = events.slice(3, 7);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Generation Live Event Platform</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Experience the event.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
              Own the moment.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant Redis-powered seat locking, fair dynamic pricing, and authenticated multi-device digital ticketing for concerts, theater, and collegiate sports.
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-10 max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 p-2 sm:p-3 rounded-2xl sm:rounded-full shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search concerts, shows, rivalries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2 px-4 py-2 w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Cities</option>
                <option value="Boston" className="bg-slate-900">Boston</option>
                <option value="New York" className="bg-slate-900">New York</option>
                <option value="Chicago" className="bg-slate-900">Chicago</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto sm:rounded-full px-6 shrink-0"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Search Events
            </Button>
          </form>

          {/* Quick CTA Links */}
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/events">
              <Button variant="secondary" size="sm">
                Explore All Events
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="sm">
                Create Audience Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Browse By Category</h2>
          <p className="text-sm text-slate-400 mt-1">Select an experience that moves you</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Concerts */}
          <Link
            to="/events?category=CONCERT"
            className="group relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/20 hover:border-purple-500/60 transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
              Concerts
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Live symphony orchestras, arena rock bands, indie synth-pop, and EDM nights.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-purple-400">
              Explore Concerts →
            </span>
          </Link>

          {/* Theater */}
          <Link
            to="/events?category=THEATER"
            className="group relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 hover:border-amber-500/60 transition-all hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Theater className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
              Theater & Plays
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Shakespeare in the Park, Broadway musical galas, and collegiate drama performances.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
              Explore Theater →
            </span>
          </Link>

          {/* Sports */}
          <Link
            to="/events?category=SPORTS"
            className="group relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 hover:border-emerald-500/60 transition-all hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              Sports
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              University Derby football rivalries, inter-college basketball finals, and tournaments.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              Explore Sports →
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Featured Events
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Top-rated live experiences on TicketPulse</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View All ({events.length}) →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Popular & Trending
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">High demand shows filling up fast</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                Upcoming Dates
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Mark your calendars for these upcoming spectacles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </section>
      )}

      {/* Platform Value Props / Why TicketPulse */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Atomic Seat Locking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero double bookings. Seats are locked atomically via Redis with an exact 5-minute checkout countdown.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Deterministic Dynamic Pricing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transparent price adjustments based on venue capacity occupancy and start time proximity.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Device Authentication</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Independent device sessions with instant granular revocation and QR-validated digital passes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
