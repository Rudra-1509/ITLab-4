import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { EventItem, EventCategory } from '../../types';
import { EventCard } from '../../components/events/EventCard';
import { EventCardSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/common/Button';

export const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const categoryParam = searchParams.get('category') || 'ALL';
  const cityParam = searchParams.get('city') || 'ALL';
  const searchParam = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedCity, setSelectedCity] = useState<string>(cityParam);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'DATE'>('POPULAR');

  useEffect(() => {
    fetchEvents();
  }, [categoryParam, cityParam, searchParam]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventsApi.getEvents({
        category: categoryParam !== 'ALL' ? categoryParam : undefined,
        city: cityParam !== 'ALL' ? cityParam : undefined,
        search: searchParam || undefined,
      });
      setEvents(data.events);
    } catch (err: any) {
      setError('Unable to load events. Please ensure backend services are reachable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
    if (selectedCity !== 'ALL') params.set('city', selectedCity);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedCity('ALL');
    setSelectedDateFilter('ALL');
    setSearchQuery('');
    setMaxPrice(2000);
    setSortBy('POPULAR');
    setSearchParams({});
  };

  // Client-side filtering & sorting
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((e) => e.category === selectedCategory);
    }

    // City filter
    if (selectedCity !== 'ALL') {
      result = result.filter((e) => e.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      );
    }

    // Max Price filter
    result = result.filter((e) => e.basePrice <= maxPrice);

    // Date filter
    const now = new Date().getTime();
    if (selectedDateFilter === 'SOON') {
      // within 7 days
      result = result.filter((e) => {
        const diff = new Date(e.date).getTime() - now;
        return diff > 0 && diff <= 7 * 86400000;
      });
    } else if (selectedDateFilter === 'MONTH') {
      // within 30 days
      result = result.filter((e) => {
        const diff = new Date(e.date).getTime() - now;
        return diff > 0 && diff <= 30 * 86400000;
      });
    }

    // Sorting
    if (sortBy === 'POPULAR') {
      result.sort((a, b) => b.ticketsSold - a.ticketsSold);
    } else if (sortBy === 'PRICE_LOW') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'PRICE_HIGH') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'DATE') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return result;
  }, [events, selectedCategory, selectedCity, searchQuery, maxPrice, selectedDateFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explore All Events
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover concerts, theater plays, and collegiate sports tournaments.
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="POPULAR">Most Popular</option>
            <option value="PRICE_LOW">Price: Low to High</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
            <option value="DATE">Event Date: Soonest</option>
          </select>
        </div>
      </div>

      {/* Filter and Search Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="CONCERT">🎵 Concerts</option>
              <option value="THEATER">🎭 Theater</option>
              <option value="SPORTS">⚽ Sports</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Cities</option>
              <option value="Boston">Boston</option>
              <option value="New York">New York</option>
              <option value="Chicago">Chicago</option>
            </select>
          </div>

          {/* Date Proximity */}
          <div>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Any Date</option>
              <option value="SOON">Happening this week</option>
              <option value="MONTH">Happening this month</option>
            </select>
          </div>
        </div>

        {/* Max Price Slider & Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">
              Max Price: <span className="font-bold text-slate-200">₹{maxPrice}</span>
            </span>
            <input
              type="range"
              min="400"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full sm:w-48 accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyFilters}
            >
              Apply Search
            </Button>
          </div>
        </div>
      </div>

      {/* Events Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEvents} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No events match your criteria"
          description="Try broadening your category, city, or price filters to discover more events."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-4">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
