import React from 'react';
import { cn } from '../../utils/formatters';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glass = false,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        glass
          ? 'bg-slate-900/60 backdrop-blur-md border-slate-800/80 shadow-xl'
          : 'bg-slate-900 border-slate-800 shadow-md',
        hoverable && 'hover:border-slate-700 hover:shadow-xl hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
