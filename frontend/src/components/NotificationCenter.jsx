import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, MessageSquare, ShieldCheck, X } from 'lucide-react';

export const NotificationCenter = ({ notifications = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const defaultNotifications = [
    {
      id: 'n1',
      title: 'Housing Application Update',
      message: 'Your visit request for UrbanNest Luxury PG was approved by Rajesh Malhotra.',
      time: '10 mins ago',
      type: 'success',
      icon: CheckCircle2
    },
    {
      id: 'n2',
      title: 'Roommate Match Alert 🤖',
      message: '96% Match found! Aarav Sharma (2nd Year CS) is looking for a roommate.',
      time: '1 hour ago',
      type: 'info',
      icon: MessageSquare
    },
    {
      id: 'n3',
      title: 'Fair Rent Price Drop 📉',
      message: 'Starlight Girls Hostel lowered rent by 8% near North Campus.',
      time: '3 hours ago',
      type: 'warning',
      icon: AlertTriangle
    }
  ];

  const list = notifications.length > 0 ? notifications : defaultNotifications;

  return (
    <div className="relative">
      <button
        onClick={() => { setIsOpen(!isOpen); setUnreadCount(0); }}
        className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors shadow-sm"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              Notifications & Alerts
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
            {list.map((n) => {
              const Icon = n.icon || Bell;
              return (
                <div key={n.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <Icon className="w-3.5 h-3.5 text-indigo-500" /> {n.title}
                    </span>
                    <span className="text-[9px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
