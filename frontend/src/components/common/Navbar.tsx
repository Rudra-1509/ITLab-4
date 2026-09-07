import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Ticket,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Calendar,
  Layers,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './Badge';
import { Button } from './Button';
import { notificationsApi } from '../../api/notifications.api';
import { NotificationItem } from '../../types';
import { formatTimeAgo } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotifsOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifs = async () => {
        try {
          const data = await notificationsApi.getNotifications();
          setNotifications(data.notifications.slice(0, 5));
          setUnreadCount(data.unreadCount);
        } catch {
          // Silent fallback
        }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 15000); // Polling every 15s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardLink = () => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'ORGANIZER') return '/organizer';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                Ticket<span className="text-indigo-400">Pulse</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/events"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/events')
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Browse Events
              </Link>

              {/* Role specific shortcuts */}
              {isAuthenticated && (
                <>
                  <Link
                    to={getDashboardLink()}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === getDashboardLink()
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    Dashboard
                  </Link>

                  {role === 'AUDIENCE' && (
                    <Link
                      to="/my-tickets"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === '/my-tickets'
                          ? 'text-indigo-400 bg-indigo-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      My Tickets
                    </Link>
                  )}

                  {role === 'ORGANIZER' && (
                    <Link
                      to="/organizer/events"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                    >
                      Manage Events
                    </Link>
                  )}

                  {role === 'ADMIN' && (
                    <Link
                      to="/admin/health"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      System Health
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex flex-1 max-w-xs md:max-w-sm relative items-center"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search concerts, plays, sports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </form>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-slate-300"
                >
                  Log in
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifsOpen(!isNotifsOpen)}
                    className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-slate-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isNotifsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setIsNotifsOpen(false)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          View all
                        </Link>
                      </div>

                      <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3.5 hover:bg-slate-850 transition-colors flex items-start justify-between gap-3 ${
                                !notif.read ? 'bg-indigo-950/20' : ''
                              }`}
                            >
                              <div>
                                <p className="text-xs font-semibold text-slate-200">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-slate-500 mt-1 block">
                                  {formatTimeAgo(notif.createdAt)}
                                </span>
                              </div>
                              {!notif.read && (
                                <button
                                  onClick={(e) => handleMarkRead(notif.id, e)}
                                  className="text-slate-500 hover:text-emerald-400 p-1 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold uppercase">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[100px]">
                        {user?.name}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-3 border-b border-slate-800 mb-1">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate mb-2">{user?.email}</p>
                        <RoleBadge role={user?.role || 'AUDIENCE'} />
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                        >
                          <Layers className="w-4 h-4 text-indigo-400" />
                          Dashboard
                        </Link>
                        {role === 'AUDIENCE' && (
                          <Link
                            to="/my-tickets"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                          >
                            <Ticket className="w-4 h-4 text-sky-400" />
                            My Tickets
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-emerald-400" />
                          Profile & Active Sessions
                        </Link>
                        {role === 'ADMIN' && (
                          <Link
                            to="/admin/health"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            System Health
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 mt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/80 space-y-2 animate-in slide-in-from-top duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500"
              />
            </form>

            <Link
              to="/events"
              className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900"
            >
              Browse Events
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900"
                >
                  Dashboard
                </Link>
                {role === 'AUDIENCE' && (
                  <Link
                    to="/my-tickets"
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900"
                  >
                    My Tickets
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900"
                >
                  Profile & Active Sessions
                </Link>
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/health"
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-emerald-400 hover:bg-slate-900"
                  >
                    System Health
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-slate-900"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Button variant="secondary" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button variant="primary" onClick={() => navigate('/register')}>
                  Create Account
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
