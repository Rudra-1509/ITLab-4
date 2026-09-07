import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  Activity,
  ShieldAlert,
  ChevronRight,
  Menu,
  X,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/Badge';
import { Navbar } from '../components/common/Navbar';

export const DashboardLayout: React.FC = () => {
  const { user, role } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = role === 'ADMIN';

  const navLinks = isAdmin
    ? [
        { label: 'Admin Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Platform Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
        {
          label: 'Service Health',
          path: '/admin/health',
          icon: <Activity className="w-4 h-4 text-emerald-400" />,
          badge: 'Live',
        },
      ]
    : [
        { label: 'Overview', path: '/organizer', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'My Events', path: '/organizer/events', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Create Event', path: '/organizer/events/create', icon: <PlusCircle className="w-4 h-4 text-indigo-400" /> },
        { label: 'Analytics Studio', path: '/organizer/analytics', icon: <BarChart3 className="w-4 h-4" /> },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24 shadow-xl">
              {/* Profile Card snippet */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
                  <RoleBadge role={role || 'AUDIENCE'} className="mt-0.5" />
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Quick switch to public browsing */}
              <div className="pt-4 mt-6 border-t border-slate-800">
                <Link
                  to="/events"
                  className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Public Event Catalog →</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Workspace */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
