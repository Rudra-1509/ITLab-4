import React from 'react';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  className = '',
}) => {
  return (
    <Card className={`p-5 relative overflow-hidden group ${className}`} hoverable>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-slate-100 tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium">
              <span className={trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-slate-800 text-indigo-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-300 transition-colors">
          {icon}
        </div>
      </div>
      {/* Decorative gradient flash */}
      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
};
