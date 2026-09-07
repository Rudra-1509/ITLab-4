import React from 'react';
import { TrendingUp, Zap, Clock, ShieldCheck, Info } from 'lucide-react';
import { PricingDetails } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../common/Card';

export interface PricingBreakdownProps {
  pricing: PricingDetails;
  className?: string;
}

export const PricingBreakdown: React.FC<PricingBreakdownProps> = ({ pricing, className = '' }) => {
  const isSurging = pricing.current_price > pricing.base_price;

  return (
    <Card className={`p-5 bg-gradient-to-br from-slate-900 to-indigo-950/30 border-indigo-500/20 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Dynamic Pricing Engine
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="text-3xl font-extrabold text-white">
              {formatCurrency(pricing.current_price)}
            </h4>
            <span className="text-xs text-slate-400">per seat</span>
          </div>
        </div>

        {isSurging ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            Surge Active
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Standard Price
          </span>
        )}
      </div>

      {/* Pricing explanation breakdown */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5 mb-4 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Base Price</span>
          <span className="font-semibold text-slate-200">{formatCurrency(pricing.base_price)}</span>
        </div>

        {pricing.pricing_factors.map((factor) => {
          if (factor === 'VERY_HIGH_DEMAND') {
            return (
              <div key={factor} className="flex items-center justify-between text-amber-400">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Very High Demand (+40%)
                </span>
                <span className="font-semibold">+{formatCurrency(Math.round(pricing.base_price * 0.4))}</span>
              </div>
            );
          }
          if (factor === 'HIGH_DEMAND') {
            return (
              <div key={factor} className="flex items-center justify-between text-amber-400">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> High Demand (+25%)
                </span>
                <span className="font-semibold">+{formatCurrency(Math.round(pricing.base_price * 0.25))}</span>
              </div>
            );
          }
          if (factor === 'MODERATE_DEMAND') {
            return (
              <div key={factor} className="flex items-center justify-between text-indigo-300">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Moderate Demand (+10%)
                </span>
                <span className="font-semibold">+{formatCurrency(Math.round(pricing.base_price * 0.1))}</span>
              </div>
            );
          }
          if (factor === 'LAST_MINUTE_SURGE') {
            return (
              <div key={factor} className="flex items-center justify-between text-rose-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Event Soon / Last-Minute (+10%)
                </span>
                <span className="font-semibold">+{formatCurrency(Math.round(pricing.base_price * 0.1))}</span>
              </div>
            );
          }
          return null;
        })}

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-slate-100">
          <span>Current Dynamic Price</span>
          <span className="text-indigo-400 text-sm">{formatCurrency(pricing.current_price)}</span>
        </div>
      </div>

      {/* Occupancy Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Venue Occupancy</span>
          <span className="font-semibold text-slate-300">{pricing.occupancy_percentage}% Sold</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              pricing.occupancy_percentage > 80
                ? 'bg-amber-500'
                : pricing.occupancy_percentage > 50
                ? 'bg-indigo-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${pricing.occupancy_percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500">
        <Info className="w-3 h-3 shrink-0" />
        <span>Prices update dynamically based on real-time Redis occupancy and start time.</span>
      </div>
    </Card>
  );
};
