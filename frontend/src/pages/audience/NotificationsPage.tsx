import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Ticket, Zap, Calendar, Info } from 'lucide-react';
import { notificationsApi } from '../../api/notifications.api';
import { NotificationItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatTimeAgo } from '../../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      await notificationsApi.markAsRead(n.id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    if (type.includes('BOOKING')) return <Ticket className="w-5 h-5 text-indigo-400" />;
    if (type.includes('LOCK')) return <Zap className="w-5 h-5 text-amber-400" />;
    if (type.includes('EVENT')) return <Calendar className="w-5 h-5 text-sky-400" />;
    return <Info className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-400" />
            Notifications
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Stay updated on booking confirmations, seat lock timers, and event alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'UNREAD'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-indigo-400" />}
          title="No notifications to show"
          description="You're all caught up! Booking updates and seat reminders will appear here."
        />
      ) : (
        <Card className="divide-y divide-slate-800 bg-slate-900 border-slate-800 overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !item.read ? 'bg-indigo-950/20' : 'hover:bg-slate-850/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-800 shrink-0 mt-0.5">
                  {getNotificationIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-indigo-400/20" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>
              </div>

              {!item.read && (
                <button
                  onClick={() => handleMarkRead(item.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};
