import React from 'react';
import { cn } from '../../utils/formatters';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'emerald' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold tracking-wide uppercase',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border leading-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string; className?: string }> = ({
  category,
  className,
}) => {
  const cat = category.toUpperCase();
  if (cat === 'CONCERT') {
    return <Badge variant="purple" className={className}>🎵 Concert</Badge>;
  }
  if (cat === 'THEATER') {
    return <Badge variant="warning" className={className}>🎭 Theater</Badge>;
  }
  if (cat === 'SPORTS') {
    return <Badge variant="success" className={className}>⚽ Sports</Badge>;
  }
  return <Badge variant="default" className={className}>{category}</Badge>;
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({
  status,
  className,
}) => {
  const s = status.toUpperCase();
  if (s === 'UPCOMING' || s === 'CONFIRMED' || s === 'VALID' || s === 'AVAILABLE') {
    return <Badge variant="success" size="sm" className={className}>● {s}</Badge>;
  }
  if (s === 'PENDING_PAYMENT' || s === 'LOCKED') {
    return <Badge variant="warning" size="sm" className={className}>● {s}</Badge>;
  }
  if (s === 'CANCELLED' || s === 'FAILED' || s === 'SOLD') {
    return <Badge variant="danger" size="sm" className={className}>● {s}</Badge>;
  }
  return <Badge variant="default" size="sm" className={className}>● {s}</Badge>;
};

export const RoleBadge: React.FC<{ role: string; className?: string }> = ({
  role,
  className,
}) => {
  const r = role.toUpperCase();
  if (r === 'ADMIN') {
    return <Badge variant="danger" size="sm" className={className}>ADMIN</Badge>;
  }
  if (r === 'ORGANIZER') {
    return <Badge variant="warning" size="sm" className={className}>ORGANIZER</Badge>;
  }
  return <Badge variant="primary" size="sm" className={className}>AUDIENCE</Badge>;
};
