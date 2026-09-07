import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Ticket,
  ShoppingBag,
  Calendar,
  Percent,
  PlusCircle,
  TrendingUp,
  BarChart3,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { analyticsApi } from '../../api/analytics.api';
import {
  AnalyticsOverview,
  EventAnalyticsItem,
  RevenueDataPoint,
} from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

export const OrganizerDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [eventsAnalytics, setEventsAnalytics] = useState<EventAnalyticsItem[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<RevenueDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, eventsRes, revRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getEventAnalytics(),
          analyticsApi.getRevenueAnalytics(),
        ]);
        setOverview(overviewRes.overview);
        setEventsAnalytics(eventsRes.events);
        setRevenueHistory(revRes.salesOverTime);
      } catch (err) {
        console.error('Failed to load organizer analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Aggregating organizer analytics..." size="lg" />
      </div>
    );
  }

  const sortedBySold = [...eventsAnalytics].sort((a, b) => b.ticketsSold - a.ticketsSold);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Organizer Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time event performance, revenue aggregation, and ticket occupancy.
          </p>
        </div>

        <Link to="/organizer/events/create">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(overview?.totalRevenue || 0)}
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          trend={{ value: '18%', isPositive: true }}
        />
        <StatCard
          title="Tickets Sold"
          value={overview?.ticketsSold || 0}
          icon={<Ticket className="w-5 h-5 text-indigo-400" />}
          trend={{ value: '12%', isPositive: true }}
        />
        <StatCard
          title="Total Bookings"
          value={overview?.bookingsCount || 0}
          icon={<ShoppingBag className="w-5 h-5 text-sky-400" />}
        />
        <StatCard
          title="Active Events"
          value={overview?.activeEvents || 0}
          icon={<Calendar className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          title="Avg Ticket Price"
          value={formatCurrency(overview?.avgTicketPrice || 0)}
          icon={<Percent className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Over Time */}
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Revenue Over Time
              </h3>
              <p className="text-xs text-slate-400">Daily sales aggregated from confirmed orders</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Tickets Sold by Event */}
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Tickets Sold by Event
              </h3>
              <p className="text-xs text-slate-400">Total admission distribution per event</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="title"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => val.split(' ')[0]}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="ticketsSold" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Tickets Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Secondary Row: Occupancy & Popular Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Bars */}
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4 lg:col-span-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-400" />
            Venue Occupancy Rates
          </h3>
          <p className="text-xs text-slate-400">Capacity fill percentage across active events</p>

          <div className="space-y-4 pt-2">
            {eventsAnalytics.slice(0, 5).map((evt) => (
              <div key={evt.eventId} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200 truncate max-w-[180px]">{evt.title}</span>
                  <span className={evt.occupancyPercentage >= 80 ? 'text-amber-400' : 'text-slate-400'}>
                    {evt.occupancyPercentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      evt.occupancyPercentage >= 80
                        ? 'bg-amber-500'
                        : evt.occupancyPercentage >= 50
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${evt.occupancyPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Popular Events Ranking */}
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Popular Events Ranking
              </h3>
              <p className="text-xs text-slate-400">Events ranked by highest ticket volume</p>
            </div>
            <Link to="/organizer/events" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Manage all →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-semibold">
                  <th className="pb-3">Event</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Tickets Sold</th>
                  <th className="pb-3">Est. Revenue</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedBySold.slice(0, 5).map((evt) => (
                  <tr key={evt.eventId} className="hover:bg-slate-850/40">
                    <td className="py-3 font-semibold text-white max-w-[180px] truncate">
                      {evt.title}
                    </td>
                    <td className="py-3 text-slate-400">{evt.category}</td>
                    <td className="py-3">
                      <span className="font-bold text-slate-200">{evt.ticketsSold}</span>
                      <span className="text-slate-500">/{evt.totalCapacity}</span>
                    </td>
                    <td className="py-3 font-bold text-emerald-400">
                      {formatCurrency(evt.estimatedRevenue)}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/organizer/events/${evt.eventId}`}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
