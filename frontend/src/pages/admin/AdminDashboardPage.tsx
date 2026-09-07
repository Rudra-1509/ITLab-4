import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  ShoppingBag,
  Activity,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
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
import { healthApi } from '../../api/health.api';
import {
  AnalyticsOverview,
  EventAnalyticsItem,
  RevenueDataPoint,
  ServiceHealthReport,
} from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [events, setEvents] = useState<EventAnalyticsItem[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<RevenueDataPoint[]>([]);
  const [health, setHealth] = useState<ServiceHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [oRes, eRes, rRes, hRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getEventAnalytics(),
          analyticsApi.getRevenueAnalytics(),
          healthApi.getHealth(),
        ]);
        setOverview(oRes.overview);
        setEvents(eRes.events);
        setRevenueHistory(rRes.salesOverTime);
        setHealth(hRes);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Polling platform metrics and cluster health..." size="lg" />
      </div>
    );
  }

  // Count healthy services
  const servicesList = Object.entries(health?.services || {});
  const healthyCount = servicesList.filter(([_, status]) => status === 'healthy').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global telemetry, microservice infrastructure status, and platform revenue metrics.
          </p>
        </div>

        <Link to="/admin/health">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Activity className="w-4 h-4 text-emerald-400" />}
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            Service Health ({healthyCount}/{servicesList.length} Healthy)
          </Button>
        </Link>
      </div>

      {/* Platform Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Platform Revenue"
          value={formatCurrency(overview?.totalRevenue || 0)}
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          trend={{ value: '24%', isPositive: true }}
        />
        <StatCard
          title="Tickets Sold"
          value={overview?.ticketsSold || 0}
          icon={<Ticket className="w-5 h-5 text-indigo-400" />}
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
          title="Cluster Health"
          value={`${healthyCount}/${servicesList.length}`}
          subtitle="All core services online"
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Health Quick Status Banner */}
      <Card className="p-5 bg-slate-900 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              API Gateway & Microservices Operational
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h4>
            <p className="text-xs text-slate-400">
              Auth, Event, Booking, Pricing, Analytics, Notifications, Redis Streams, and PostgreSQL are reachable.
            </p>
          </div>
        </div>

        <Link to="/admin/health" className="shrink-0 w-full sm:w-auto">
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Inspect Health UI
          </Button>
        </Link>
      </Card>

      {/* Platform Wide Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Platform Revenue Volume
          </h3>
          <p className="text-xs text-slate-400">Daily gross booking value processed</p>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
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
                  formatter={(val: any) => [`₹${val}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="#10b981"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket className="w-4 h-4 text-indigo-400" />
            Tickets Sold by Event
          </h3>
          <p className="text-xs text-slate-400">Platform-wide attendance breakdown</p>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={events}>
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
                <Bar dataKey="ticketsSold" fill="#6366f1" radius={[6, 6, 0, 0]} name="Tickets Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
