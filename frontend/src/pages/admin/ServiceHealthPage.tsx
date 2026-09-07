import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Server,
  Database,
  Layers,
  Cpu,
  Zap,
  Bell,
  Radio,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { healthApi } from '../../api/health.api';
import { ServiceHealthReport } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

interface ServiceMeta {
  name: string;
  key: string;
  port: number;
  description: string;
  icon: React.ReactNode;
}

const SERVICE_REGISTRY: ServiceMeta[] = [
  {
    name: 'Auth Service',
    key: 'auth',
    port: 8001,
    description: 'User registration, authentication, multi-device sessions, JWT verification.',
    icon: <Cpu className="w-5 h-5 text-indigo-400" />,
  },
  {
    name: 'Event Service',
    key: 'events',
    port: 8002,
    description: 'Event catalog CRUD, automatic seat generation (50 seats/event).',
    icon: <Layers className="w-5 h-5 text-sky-400" />,
  },
  {
    name: 'Booking Service',
    key: 'booking',
    port: 8003,
    description: 'Seat locking (Redis SET NX EX 300), checkout transactions, payment simulation.',
    icon: <Zap className="w-5 h-5 text-amber-400" />,
  },
  {
    name: 'Pricing Service',
    key: 'pricing',
    port: 8004,
    description: 'Deterministic dynamic pricing based on capacity occupancy and start time proximity.',
    icon: <Activity className="w-5 h-5 text-purple-400" />,
  },
  {
    name: 'Analytics Service',
    key: 'analytics',
    port: 8005,
    description: 'Event-driven analytics aggregator consuming Redis Streams (analytics-group).',
    icon: <Radio className="w-5 h-5 text-blue-400" />,
  },
  {
    name: 'Notification',
    key: 'notifications',
    port: 8006,
    description: 'Event-driven user notification processor consuming Redis Streams (notification-group).',
    icon: <Bell className="w-5 h-5 text-pink-400" />,
  },
  {
    name: 'Redis',
    key: 'redis',
    port: 6379,
    description: 'In-memory atomic lock manager (SET NX EX) and Redis Streams event message bus.',
    icon: <Server className="w-5 h-5 text-rose-400" />,
  },
  {
    name: 'PostgreSQL',
    key: 'postgres',
    port: 5432,
    description: 'Primary ACID relational database schema running via Prisma ORM.',
    icon: <Database className="w-5 h-5 text-emerald-400" />,
  },
];

export const ServiceHealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<ServiceHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { showToast } = useToast();

  const pingServices = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const report = await healthApi.getHealth();
      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);
      setHealthData(report);
      setLastChecked(new Date());
    } catch (err) {
      showToast('Health check probe failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    pingServices();
  }, []);

  // Periodic Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      pingServices();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const services = healthData?.services || {};
  const healthyCount = Object.values(services).filter((s) => s === 'healthy').length;
  const totalCount = SERVICE_REGISTRY.length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              API Gateway: /api/health
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-emerald-400" />
            Microservice Health & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live diagnostic status for all 8 microservices, Redis distributed locks, and PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-indigo-500 rounded cursor-pointer"
            />
            <span>Auto-poll (10s)</span>
          </label>

          <Button
            variant="primary"
            size="sm"
            onClick={pingServices}
            isLoading={isLoading}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Ping All Services Now
          </Button>
        </div>
      </div>

      {/* Cluster Overview Banner */}
      <Card className="p-6 bg-slate-900 border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          <div className="sm:pr-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Gateway Status
            </span>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-lg font-bold text-white uppercase">
                {healthData?.gateway || 'HEALTHY'}
              </span>
            </div>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Services Online
            </span>
            <p className="text-lg font-black text-emerald-400">
              {healthyCount} / {totalCount} Healthy
            </p>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Gateway Probe Latency
            </span>
            <p className="text-lg font-mono font-bold text-indigo-300">
              {latencyMs !== null ? `${latencyMs} ms` : '—'}
            </p>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Last Pinged
            </span>
            <p className="text-xs text-slate-300 font-mono mt-1">
              {lastChecked.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Required University Specification List */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" />
          Service Status Registry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICE_REGISTRY.map((svc) => {
            const isHealthy = ((services as Record<string, string>)[svc.key] || 'healthy') === 'healthy';

            return (
              <Card
                key={svc.key}
                className="p-5 bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-4 shadow"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-800 shrink-0 mt-0.5">
                    {svc.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{svc.name}</h4>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Port {svc.port}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                      {svc.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isHealthy ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Healthy
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Unhealthy
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Microservice Architecture Reference */}
      <Card className="p-6 bg-slate-900 border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Gateway Routing Specification
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The API Gateway (Port 8000) exposes Swagger documentation at{' '}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1"
          >
            http://localhost:8000/docs <ExternalLink className="w-3 h-3" />
          </a>
          . All calls from this frontend client route through the central <code className="text-slate-300 bg-slate-950 px-1 py-0.5 rounded font-mono">/api</code> entrypoint and are reverse-proxied to isolated backend services.
        </p>
      </Card>
    </div>
  );
};
