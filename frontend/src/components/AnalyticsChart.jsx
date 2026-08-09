import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

// Animated progress bar bar chart
const BarChart = ({ items }) => (
  <div className="space-y-3">
    {items.map((item, idx) => {
      const color = item.color || '#6366f1';
      const percentage = item.percentage !== undefined ? item.percentage : 50;
      return (
        <div key={idx} className="space-y-1 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="truncate max-w-[180px]">{item.name || item.category || item.label}</span>
            </span>
            <span className="text-[11px] text-slate-500 shrink-0 ml-2">
              {item.count !== undefined ? `${item.count} (${percentage}%)` : `${percentage}%`}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(Math.max(percentage, 3), 100)}%`,
                backgroundColor: color,
                boxShadow: `0 0 6px ${color}55`
              }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

// Horizontal value chart for rankings
const HorizontalChart = ({ items }) => {
  const maxVal = Math.max(...items.map(i => i.count || i.percentage || 1), 1);
  return (
    <div className="flex items-end justify-around gap-3 h-32 mt-2">
      {items.slice(0, 6).map((item, idx) => {
        const color = item.color || '#6366f1';
        const val = item.count || item.percentage || 0;
        const heightPct = (val / maxVal) * 100;
        return (
          <div key={idx} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[9px] font-bold text-slate-500">{val}</span>
            <div className="w-full rounded-t-lg transition-all duration-700 min-h-[4px]"
              style={{ height: `${Math.max(heightPct, 4)}%`, backgroundColor: color, opacity: 0.85 }}
            />
            <span className="text-[8px] text-slate-400 text-center leading-tight truncate w-full text-center">
              {(item.name || item.category || '').split(' ')[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Donut chart (SVG)
const DonutChartViz = ({ items }) => {
  const total = items.reduce((s, i) => s + (i.count || i.percentage || 0), 0) || 1;
  let cumulative = 0;
  const size = 100, cx = 50, cy = 50, r = 36;
  const toRad = (a) => ((a - 90) * Math.PI) / 180;

  const paths = items.map((item, i) => {
    const val = item.count || item.percentage || 0;
    const angle = (val / total) * 360;
    const startAngle = cumulative;
    cumulative += angle;
    if (angle <= 0) return null;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(cumulative - 0.01));
    const y2 = cy + r * Math.sin(toRad(cumulative - 0.01));
    const largeArc = angle > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={i} d={d} fill={item.color || '#6366f1'} opacity="0.88" />;
  }).filter(Boolean);

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
        {paths}
        <circle cx={cx} cy={cy} r={r - 14} fill="white" className="dark:fill-slate-900" />
      </svg>
      <div className="space-y-1.5 text-[10px] font-semibold">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color || '#6366f1' }} />
            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
              {item.name || item.category}
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-bold ml-auto shrink-0">
              {item.percentage ?? item.count ?? 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnalyticsChart = ({ title, subtitle, items = [], type = 'bar', className = '' }) => {
  const [chartType, setChartType] = useState(type);

  const renderChart = () => {
    switch (chartType) {
      case 'donut': return <DonutChartViz items={items} />;
      case 'column': return <HorizontalChart items={items} />;
      default: return <BarChart items={items} />;
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:shadow-md transition-all ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-start justify-between gap-2">
          <div>
            {title && <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{subtitle}</p>}
          </div>
          {/* Chart type toggle */}
          <div className="flex items-center gap-1 shrink-0">
            {['bar', 'column', 'donut'].map(t => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`p-1 rounded text-[9px] font-bold transition-colors ${
                  chartType === t
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={t}
              >
                {t === 'bar' ? '▬' : t === 'column' ? '▮' : '◉'}
              </button>
            ))}
          </div>
        </div>
      )}

      {renderChart()}
    </div>
  );
};
