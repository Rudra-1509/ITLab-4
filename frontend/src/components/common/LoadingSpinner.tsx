import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-400">
      <Loader2 className={`${sizeClass} animate-spin text-indigo-500`} />
      {message && <p className="text-sm font-medium animate-pulse">{message}</p>}
    </div>
  );
};

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-6 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="pt-3 border-t border-slate-800 flex justify-between">
          <div className="h-5 bg-slate-800 rounded w-1/4" />
          <div className="h-5 bg-slate-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-850 rounded-xl bg-slate-900/60 border border-slate-800/80" />
      ))}
    </div>
  );
};
