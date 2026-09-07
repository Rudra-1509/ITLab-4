import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Shield,
  Laptop,
  Smartphone,
  Globe,
  Trash2,
  LogOut,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/auth.api';
import { UserSession } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RoleBadge } from '../../components/common/Badge';
import { formatDate, formatTimeAgo } from '../../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user, role, logout, logoutAll } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await authApi.getSessions();
      setSessions(res.sessions);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authApi.revokeSession(sessionId);
      showToast('Session revoked successfully.', 'success');
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      showToast('Failed to revoke session.', 'error');
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to log out from all devices?')) {
      await logoutAll();
      showToast('Logged out from all devices.', 'info');
      navigate('/login');
    }
  };

  const handleCurrentLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.toLowerCase().includes('phone') || deviceName.toLowerCase().includes('mobile')) {
      return <Smartphone className="w-5 h-5 text-sky-400" />;
    }
    if (deviceName.toLowerCase().includes('linux')) {
      return <Globe className="w-5 h-5 text-amber-400" />;
    }
    return <Laptop className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Account Profile & Security
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your credentials, active multi-device sessions, and global security controls.
        </p>
      </div>

      {/* User Information Card */}
      <Card className="p-6 sm:p-8 bg-slate-900 border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-xl shadow-indigo-600/20">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <RoleBadge role={role || 'AUDIENCE'} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Member since {user?.createdAt ? formatDate(user.createdAt) : 'September 2026'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCurrentLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="border-slate-700 hover:border-slate-600 text-slate-300"
          >
            Log Out This Device
          </Button>
        </div>
      </Card>

      {/* Multi-Device Sessions Card */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Active Device Sessions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Independent multi-device authentication allows simultaneous logins without invalidating other devices.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={handleLogoutAll}
            leftIcon={<ShieldAlert className="w-4 h-4" />}
          >
            Logout All Devices
          </Button>
        </div>

        {/* Sessions list */}
        <Card className="divide-y divide-slate-800 bg-slate-900 border-slate-800 overflow-hidden">
          {isLoadingSessions ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading active sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No other active sessions.</div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-800 shrink-0 mt-0.5">
                    {getDeviceIcon(sess.deviceName)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{sess.deviceName}</h4>
                      {sess.isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Current Device
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          • {formatTimeAgo(sess.lastActive)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 max-w-md font-mono">
                      {sess.userAgent}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Logged in {formatDate(sess.loginTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!sess.isCurrent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(sess.id)}
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                      className="border-slate-700 hover:border-rose-700/60 hover:text-rose-300 text-xs"
                    >
                      Logout Session
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold pr-2">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active now
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* University Architecture Explanation Box */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white">Multi-Device Architecture: </span>
          <p className="text-slate-400 leading-relaxed">
            Unlike simple single-token setups, each login generates an independent cryptographic session registered in PostgreSQL and Redis. Revoking a session immediately halts that specific token's API gateway authorization while leaving other devices fully authenticated.
          </p>
        </div>
      </div>
    </div>
  );
};
