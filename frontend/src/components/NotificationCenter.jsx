import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle2, AlertTriangle, MessageSquare, X, Check, XCircle, Loader2, ShoppingBag, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export const NotificationCenter = ({ notifications: propNotifications = [] }) => {
  const { user, token } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [realNotifications, setRealNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [respondingId, setRespondingId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRealNotifications(data.data || []);
      }
    } catch (e) {
      // Silently fail — will show fallback
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (isOpen && token && user) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Poll for new notifications every 30s while bell is closed
  useEffect(() => {
    if (!token || !user) return;
    const interval = setInterval(fetchNotifications, 30000);
    // Initial fetch on mount
    fetchNotifications();
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRealNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (e) {}
  };

  const handleRespond = async (notification, action) => {
    if (!token) return;
    setRespondingId(notification._id);
    try {
      const res = await fetch('/api/notifications/respond-roommate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          requestId: notification.requestId,
          notificationId: notification._id,
          action
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(action === 'accepted' ? 'Roommate request accepted! ✅' : 'Request declined.');
        // Update notification locally
        setRealNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, actionStatus: action, read: true } : n)
        );
      } else {
        showError(data.message || 'Failed to respond');
      }
    } catch (e) {
      showError('Network error. Please try again.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRealNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  // Demo fallback notifications (only shown when not logged in or no real notifications yet)
  const defaultNotifications = [
    {
      id: 'demo_n1',
      title: 'Welcome to StaySmart AI! 👋',
      message: 'Find PGs, connect with roommates, buy & sell items — all in one place. Log in to get real notifications.',
      time: 'Just now',
      type: 'system',
      icon: Bell,
      read: false
    }
  ];

  // Decide which list to show
  const useReal = user && token && realNotifications.length > 0;
  const list = useReal ? realNotifications : (propNotifications.length > 0 ? propNotifications : defaultNotifications);
  const unreadCount = useReal
    ? realNotifications.filter(n => !n.read).length
    : (propNotifications.length > 0 ? propNotifications.filter(n => !n.read).length : 1);

  const getIcon = (type) => {
    switch (type) {
      case 'roommate_request': return Users;
      case 'roommate_response': return Users;
      case 'marketplace_interest': return ShoppingBag;
      default: return Bell;
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return created.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0 && user && token) {
            handleMarkAllRead();
          }
        }}
        className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors shadow-sm"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-500" /> Notifications
              {useReal && <span className="text-slate-400 font-normal">({realNotifications.length})</span>}
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
              {list.map((n) => {
                const Icon = n.icon || getIcon(n.type);
                const isUnread = !n.read;
                const isRoommateRequest = n.type === 'roommate_request' && n.actionStatus === 'pending';
                const isResponding = respondingId === n._id;
                const notifId = n._id || n.id;

                return (
                  <div
                    key={notifId}
                    onClick={() => { if (isUnread && n._id) handleMarkRead(n._id); }}
                    className={`p-3 rounded-2xl border space-y-1.5 cursor-pointer transition-colors ${
                      isUnread
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Icon className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="line-clamp-1">{n.title}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        )}
                        <span className="text-[9px] text-slate-400">{n.time || formatTime(n.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>

                    {/* Accept/Reject for roommate requests */}
                    {isRoommateRequest && (
                      <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleRespond(n, 'accepted')}
                          disabled={isResponding}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
                        >
                          {isResponding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(n, 'rejected')}
                          disabled={isResponding}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-60"
                        >
                          {isResponding ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          Decline
                        </button>
                      </div>
                    )}

                    {/* Show result for responded requests */}
                    {n.type === 'roommate_request' && n.actionStatus === 'accepted' && (
                      <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> You accepted this request
                      </div>
                    )}
                    {n.type === 'roommate_request' && n.actionStatus === 'rejected' && (
                      <div className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> You declined this request
                      </div>
                    )}
                  </div>
                );
              })}

              {list.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No notifications yet.
                </div>
              )}
            </div>
          )}

          {!user && (
            <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800 pt-2">
              Log in to see your real notifications
            </p>
          )}
        </div>
      )}
    </div>
  );
};
