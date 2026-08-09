import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = (msg) => addToast(msg, 'success');
  const showError = (msg) => addToast(msg, 'error');
  const showInfo = (msg) => addToast(msg, 'info');
  const showWarning = (msg) => addToast(msg, 'warning');

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const config = {
            success: { bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300', icon: CheckCircle2, iconColor: 'text-emerald-500' },
            error: { bg: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300', icon: XCircle, iconColor: 'text-rose-500' },
            warning: { bg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300', icon: AlertTriangle, iconColor: 'text-amber-500' },
            info: { bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:text-indigo-300', icon: Info, iconColor: 'text-indigo-500' },
          }[toast.type] || {};

          const Icon = config.icon || Info;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${config.bg}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${config.iconColor}`} />
                <p className="text-xs font-bold leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      showSuccess: (m) => console.log('Toast:', m),
      showError: (m) => console.error('Toast Error:', m),
      showInfo: (m) => console.log('Toast Info:', m),
      showWarning: (m) => console.warn('Toast Warning:', m)
    };
  }
  return context;
};
