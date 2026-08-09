import React from 'react';

export const SkeletonCard = ({ count = 1, type = 'pg' }) => {
  const cards = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div className="space-y-4 w-full">
        {cards.map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 animate-pulse flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="w-24 h-24 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2.5 w-full">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              <div className="flex gap-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm animate-pulse space-y-4"
        >
          <div className="h-48 bg-slate-200 dark:bg-slate-800 relative">
            <div className="absolute top-3 left-3 w-20 h-6 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <div className="absolute top-3 right-3 w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
          <div className="p-5 space-y-3">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-4/5" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-20" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-14" />
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-24" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
