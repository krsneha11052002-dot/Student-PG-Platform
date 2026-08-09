import React, { useState, useEffect } from 'react';
import { useCollege } from '../context/CollegeContext';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { NotificationCenter } from '../components/NotificationCenter';
import {
  Users, MessageSquare, ShoppingBag, Search, Wrench, AlertTriangle,
  FileText, ShieldCheck, Download, Sparkles, TrendingUp, RefreshCw,
  Star, Bell, Heart, MapPin, Activity, Zap, BarChart3
} from 'lucide-react';

// ── Mini Stat ────────────────────────────────────────────────────────────
const MiniStat = ({ label, value, sub, color = '#6366f1', icon: Icon }) => (
  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-2">
    {Icon && (
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    )}
    <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
    <div className="text-xs font-semibold text-slate-500">{label}</div>
    {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
  </div>
);

// ── Trending Topic Pill ──────────────────────────────────────────────────
const TrendingPill = ({ topic, count, delta, color }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-sm transition-all cursor-pointer group">
    <div className="flex items-center gap-2">
      <TrendingUp className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        #{topic}
      </span>
    </div>
    <div className="text-right">
      <div className="text-xs font-extrabold" style={{ color }}>{count} posts</div>
      <div className="text-[9px] text-emerald-500 font-bold">+{delta}% this week</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
// Main Community Dashboard
// ─────────────────────────────────────────────────────────────────────────
export const CommunityDashboard = () => {
  const { selectedCollege, changeCollege } = useCollege();
  const collegeShort = selectedCollege?.shortName || 'Campus';

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/community?collegeShortName=${encodeURIComponent(collegeShort)}`);
        const data = await res.json();
        if (data.success) setAnalytics(data.communityStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityData();
  }, [collegeShort]);

  const stats = analytics || {
    activePosters: 142, dailyPosts: 38, resolvedLostFound: 19,
    activeServices: 16, sosAlertsTriggered: 2, sosAlertsResolved: 2
  };

  const communityNotifications = [
    { id: 'c1', title: '🚨 SOS Cleared', message: 'Gas leak alert at Boys Hostel-B resolved. Area declared safe.', time: '30m ago', type: 'success', icon: ShieldCheck },
    { id: 'c2', title: '📦 Lost Item Found', message: 'Physics textbook reported lost by Ananya found near library exit.', time: '2h ago', type: 'info', icon: Search },
    { id: 'c3', title: '🔥 Trending: #SemesterRush', message: 'Over 180 posts in the last 6 hours under this topic.', time: '3h ago', type: 'info', icon: TrendingUp },
  ];

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'trending', label: '🔥 Trending' },
    { id: 'ai', label: '🤖 AI Insights' },
    { id: 'reports', label: '📋 Reports' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-300">

      {/* ── Header Banner ── */}
      <div className="p-7 rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Users className="w-4 h-4 text-indigo-400" /> {collegeShort} · Verified Campus Analytics
          </div>
          <h1 className="text-3xl font-extrabold">Community Dashboard 📊</h1>
          <p className="text-xs text-indigo-200 max-w-lg">
            Real-time analytics for student discussions, marketplace trades, lost & found claims, local services, and campus SOS status.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <NotificationCenter notifications={communityNotifications} />
          <button
            onClick={changeCollege}
            className="px-4 py-2.5 rounded-2xl bg-white/15 text-white font-bold text-xs border border-white/20 hover:bg-white/25 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Switch Campus
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4 text-indigo-600" /> Export Report
          </button>
        </div>
      </div>

      {/* ── Top KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <MiniStat label="Active Posters" value={stats.activePosters} sub="+18% this month" color="#6366f1" icon={Users} />
        <MiniStat label="Daily Posts" value={stats.dailyPosts} sub="100% peer verified" color="#8b5cf6" icon={MessageSquare} />
        <MiniStat label="Items Returned" value={stats.resolvedLostFound} sub="Lost & Found" color="#10b981" icon={Search} />
        <MiniStat label="Local Services" value={stats.activeServices} sub="Near campus" color="#0ea5e9" icon={Wrench} />
        <MiniStat label="SOS Alerts" value={`${stats.sosAlertsResolved}/${stats.sosAlertsTriggered}`} sub="All Resolved ✅" color="#ef4444" icon={AlertTriangle} />
        <MiniStat label="AI Posts Flagged" value="8" sub="Spam removed" color="#f59e0b" icon={ShieldCheck} />
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Marketplace Category Trade Volume"
              subtitle="Distribution of student second-hand items sold"
              items={[
                { category: 'Textbooks & PYQ Notes', count: 48, percentage: 43, color: '#6366f1' },
                { category: 'Study Desks & Chairs', count: 32, percentage: 28, color: '#8b5cf6' },
                { category: 'Mini-Fridges & Heaters', count: 20, percentage: 18, color: '#ec4899' },
                { category: 'Bicycles & Scooters', count: 12, percentage: 11, color: '#10b981' },
              ]}
            />
            <AnalyticsChart
              title="Local Student Service Ratings"
              subtitle="Highest rated service providers near campus"
              items={[
                { category: 'Annapurna Homestyle Tiffin', count: 38, percentage: 96, color: '#10b981' },
                { category: 'Express 24/7 Laundry', count: 29, percentage: 92, color: '#3b82f6' },
                { category: 'PrintHub Xerox Center', count: 54, percentage: 98, color: '#f59e0b' },
                { category: 'Campus Bike Rental', count: 22, percentage: 94, color: '#8b5cf6' },
              ]}
            />
          </div>

          {/* Forum Activity Heatmap Proxy */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Community Activity by Day (This Week)
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const posts = [42, 38, 55, 61, 78, 34, 22][i];
                const max = 78;
                const intensity = Math.round((posts / max) * 9);
                const colors = [
                  '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8',
                  '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'
                ];
                return (
                  <div key={day} className="text-center space-y-2">
                    <div
                      className="h-16 rounded-xl transition-all hover:scale-105"
                      style={{ backgroundColor: colors[intensity - 1] || colors[0] }}
                      title={`${posts} posts`}
                    />
                    <div className="text-[10px] font-bold text-slate-500">{day}</div>
                    <div className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">{posts}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TRENDING TAB ── */}
      {activeTab === 'trending' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" /> 🔥 Hot Topics This Week
              </h3>
              <div className="space-y-2">
                {[
                  { topic: 'SemesterRush', count: 284, delta: 320, color: '#ef4444' },
                  { topic: 'Roommate2024', count: 198, delta: 142, color: '#f59e0b' },
                  { topic: 'PGRentHike', count: 167, delta: 88, color: '#8b5cf6' },
                  { topic: 'TextbookSwap', count: 143, delta: 65, color: '#6366f1' },
                  { topic: 'CampusAlert', count: 92, delta: 48, color: '#10b981' },
                  { topic: 'MessFoodReview', count: 78, delta: 31, color: '#0ea5e9' },
                  { topic: 'ExamSeason', count: 64, delta: 22, color: '#ec4899' },
                ].map((t, i) => <TrendingPill key={i} {...t} />)}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> 🏆 Most Engaged Posts This Month
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { title: '"Gas leak in Boys Hostel B — Everyone stay away"', author: 'Priya K.', likes: 348, comments: 92, tag: 'Emergency' },
                  { title: '"Complete guide: Cheapest PGs near BITS under ₹7000"', author: 'Rahul M.', likes: 297, comments: 61, tag: 'Housing' },
                  { title: '"Selling complete 2nd year CSE notes — all branches"', author: 'Sneha T.', likes: 243, comments: 48, tag: 'Marketplace' },
                  { title: '"Roommate wanted: Non-smoker, night owl, ENTJ preferred"', author: 'Arjun S.', likes: 189, comments: 37, tag: 'Roommates' },
                  { title: '"Review: New tiffin service near gate 2 (8.5/10)"', author: 'Kavya R.', likes: 152, comments: 29, tag: 'Services' },
                ].map((p, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-sm transition-all space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{p.title}</span>
                      <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        p.tag === 'Emergency' ? 'bg-rose-500/10 text-rose-600' :
                        p.tag === 'Housing' ? 'bg-indigo-500/10 text-indigo-600' :
                        p.tag === 'Marketplace' ? 'bg-purple-500/10 text-purple-600' :
                        p.tag === 'Roommates' ? 'bg-emerald-500/10 text-emerald-600' :
                        'bg-amber-500/10 text-amber-600'
                      }`}>{p.tag}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>by {p.author}</span>
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1">❤️ {p.likes}</span>
                        <span className="flex items-center gap-1">💬 {p.comments}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI INSIGHTS TAB ── */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsChart
              title="AI Community Post Classification"
              subtitle="How AI categorized 38 daily posts"
              items={[
                { category: 'General Discussion', count: 14, percentage: 37, color: '#6366f1' },
                { category: 'Marketplace Listings', count: 9, percentage: 24, color: '#8b5cf6' },
                { category: 'Roommate Requests', count: 6, percentage: 16, color: '#10b981' },
                { category: 'Lost & Found', count: 5, percentage: 13, color: '#f59e0b' },
                { category: 'Emergency/SOS', count: 2, percentage: 5, color: '#ef4444' },
                { category: 'Spam (Removed)', count: 2, percentage: 5, color: '#94a3b8' },
              ]}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> AI Campus Intelligence Report
              </h3>
              <div className="space-y-3">
                {[
                  { emoji: '🏠', title: 'Housing Demand Spike', detail: 'Semester start: 42% more PG searches than last month. Recommend listing expansion.', color: '#6366f1' },
                  { emoji: '🔒', title: 'Safety Pattern Detected', detail: '3 noise complaints from Zone-4 hostel in 48h. Proactive alert sent to warden.', color: '#ef4444' },
                  { emoji: '📦', title: 'Textbook Exchange Peak', detail: 'AI suggests a dedicated "Semester Start Swap" event — potential 200+ trades.', color: '#f59e0b' },
                  { emoji: '🤝', title: 'Roommate Compatibility', detail: '82% of AI-matched pairs are still cohabitating after 2 months — record high.', color: '#10b981' },
                  { emoji: '🌍', title: 'Translation Usage', detail: '34 posts translated for non-Hindi speakers this week — 8 languages used.', color: '#8b5cf6' },
                ].map((ins, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: `${ins.color}0a`, border: `1px solid ${ins.color}20` }}>
                    <span className="text-base shrink-0">{ins.emoji}</span>
                    <div>
                      <div className="text-xs font-extrabold" style={{ color: ins.color }}>{ins.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{ins.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Spam & Scam Log */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-500" /> AI Spam & Scam Detection Log (Last 7 Days)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2 text-left">Post Excerpt</th>
                    <th className="pb-2 text-left">Detection Type</th>
                    <th className="pb-2 text-left">AI Confidence</th>
                    <th className="pb-2 text-left">Action Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {[
                    { text: '"Need urgent money — send UPI NOW"', type: 'Scam / Phishing', confidence: 97, action: 'Removed + User Warned' },
                    { text: '"Buy my crypto — 10x returns guaranteed"', type: 'Financial Scam', confidence: 99, action: 'Removed + Reported' },
                    { text: '"Click link for free PG discount code"', type: 'Spam Link', confidence: 94, action: 'Removed' },
                    { text: '"Same post #12 about Tiffin service"', type: 'Duplicate Spam', confidence: 88, action: 'Merged with Original' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-medium italic text-slate-500 max-w-[200px] truncate">{row.text}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">{row.type}</span>
                      </td>
                      <td className="py-3 font-extrabold" style={{ color: row.confidence >= 95 ? '#ef4444' : '#f59e0b' }}>{row.confidence}%</td>
                      <td className="py-3 font-semibold text-emerald-600 dark:text-emerald-400">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORTS TAB ── */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Weekly Engagement Summary', desc: 'Posts, comments, and reactions breakdown for W32.', icon: BarChart3, color: '#6366f1' },
              { title: 'SOS & Safety Report', desc: 'All emergency alerts, responses, and resolution timelines.', icon: AlertTriangle, color: '#ef4444' },
              { title: 'Marketplace Trade Report', desc: 'Category-wise trade volume and fraud flags for last 30 days.', icon: ShoppingBag, color: '#8b5cf6' },
              { title: 'Roommate Match Analytics', desc: 'Success rates, compatibility scores, and match statistics.', icon: Users, color: '#10b981' },
              { title: 'Lost & Found Log', desc: 'Claims made, items returned, and unresolved entries.', icon: Search, color: '#f59e0b' },
              { title: 'AI Moderation Report', desc: 'Spam, scam, and duplicate post detection audit trail.', icon: ShieldCheck, color: '#0ea5e9' },
            ].map((r, i) => (
              <button
                key={i}
                onClick={() => window.print()}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all text-left group flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: `${r.color}15` }}>
                  <r.icon className="w-5 h-5" style={{ color: r.color }} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{r.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{r.desc}</div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-bold" style={{ color: r.color }}>
                    <Download className="w-3 h-3" /> Download PDF
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Summary Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Monthly Performance Summary — {collegeShort}
            </h3>
            <table className="w-full text-xs">
              <thead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-3 text-left">Metric</th>
                  <th className="pb-3 text-right">This Month</th>
                  <th className="pb-3 text-right">Last Month</th>
                  <th className="pb-3 text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {[
                  { metric: 'Total Community Posts', curr: 1142, prev: 968, upGood: true },
                  { metric: 'Marketplace Transactions', curr: 84, prev: 71, upGood: true },
                  { metric: 'Lost Items Returned', curr: 19, prev: 14, upGood: true },
                  { metric: 'SOS Alerts Triggered', curr: 2, prev: 5, upGood: false },
                  { metric: 'Spam Posts Removed', curr: 8, prev: 18, upGood: false },
                  { metric: 'New Roommate Matches', curr: 34, prev: 22, upGood: true },
                ].map((row, i) => {
                  const change = row.curr - row.prev;
                  const pct = Math.round(Math.abs(change / row.prev) * 100);
                  const isUp = change > 0;
                  const isGood = isUp === row.upGood;
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-semibold">{row.metric}</td>
                      <td className="py-3 text-right font-extrabold text-slate-900 dark:text-white">{row.curr}</td>
                      <td className="py-3 text-right text-slate-500">{row.prev}</td>
                      <td className={`py-3 text-right font-extrabold ${isGood ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {isUp ? '+' : '-'}{pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
