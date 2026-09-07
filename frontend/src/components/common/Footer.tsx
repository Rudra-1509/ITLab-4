import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Github, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Ticket<span className="text-indigo-400">Pulse</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              University System Design / Software Interface Project. Next-gen distributed ticketing platform with atomic seat reservation & dynamic pricing.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Microservices Live on Port 8000</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">All Events</Link>
              </li>
              <li>
                <Link to="/events?category=CONCERT" className="hover:text-white transition-colors">Concerts & Gigs</Link>
              </li>
              <li>
                <Link to="/events?category=THEATER" className="hover:text-white transition-colors">Theater & Plays</Link>
              </li>
              <li>
                <Link to="/events?category=SPORTS" className="hover:text-white transition-colors">Sports Matches</Link>
              </li>
            </ul>
          </div>

          {/* Roles & Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Audience Dashboard</Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-white transition-colors">Organizer Hub</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">Platform Admin</Link>
              </li>
              <li>
                <Link to="/admin/health" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Service Health
                </Link>
              </li>
            </ul>
          </div>

          {/* Demo Tech Specs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Architecture</h4>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Redis Atomic Lock (SET NX EX 300)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deterministic Dynamic Pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Multi-Device Session Revocation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <p>© 2026 TicketPulse Platform. Built for University System Design Presentation.</p>
          <p className="flex items-center gap-1">
            API Gateway: <code className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">/api</code>
          </p>
        </div>
      </div>
    </footer>
  );
};
