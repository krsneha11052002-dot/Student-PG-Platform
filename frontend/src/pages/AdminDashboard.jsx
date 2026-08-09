import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Users, Building2, CheckCircle2, XCircle, Star, AlertTriangle,
  TrendingUp, MessageSquare, ShoppingBag, Sparkles, Bell, Download, RefreshCw,
  BarChart3, PieChart, FileText, Activity, Clock, ArrowUpRight, ArrowDownRight,
  Search, Filter, Eye, Trash2, Ban, ChevronRight, Zap, Globe, Brain
} from 'lucide-react';
import { NotificationCenter } from '../components/NotificationCenter';
import { AnalyticsChart } from '../components/AnalyticsChart';

// ── Mini Stat Card ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = '#6366f1', icon: Icon, trend, trendUp }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-start justify-between gap-2">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
        style={{ backgroundColor: `${color}18` }}
      >
        {Icon && <Icon className="w-5 h-5" style={{ color }} />}
      </div>
      {trend && (
        <span className={`text-[10px] font-bold flex items-center gap-0.5 px-2 py-1 rounded-full ${
          trendUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'
        }`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
      )}
    </div>
    <div className="mt-3 space-y-0.5">
      <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
    </div>
  </div>
);

// ── Review Rating Bars ──────────────────────────────────────────────────────
const RatingBar = ({ label, value, max = 5 }) => {
  const pct = (value / max) * 100;
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-24 text-slate-600 dark:text-slate-400 font-semibold capitalize shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{value}</span>
    </div>
  );
};

// ── Donut Segment (inline SVG) ──────────────────────────────────────────────
const DonutChart = ({ segments = [], size = 120 }) => {
  const cx = size / 2, cy = size / 2, r = (size - 24) / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const paths = segments.map((seg, i) => {
    const angle = (seg.value / total) * 360;
    const startAngle = cumulative;
    cumulative += angle;
    const toRad = (a) => ((a - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(cumulative));
    const y2 = cy + r * Math.sin(toRad(cumulative));
    const largeArc = angle > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={i} d={d} fill={seg.color} opacity="0.9" className="hover:opacity-100 transition-opacity" />;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r - 8} fill="transparent" stroke="transparent" />
      {paths}
      <circle cx={cx} cy={cy} r={r - 20} fill="white" className="dark:fill-slate-900" />
    </svg>
  );
};

// ── Tab button ──────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
      active
        ? 'bg-indigo-600 text-white shadow-md'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`}
  >
    {children}
  </button>
);

// ── Section Heading ─────────────────────────────────────────────────────────
const SectionHeading = ({ icon: Icon, iconColor = '#6366f1', children, action }) => (
  <div className="flex items-center justify-between">
    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" style={{ color: iconColor }} />}
      {children}
    </h2>
    {action}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Admin Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [complaintStats, setComplaintStats] = useState(null);
  const [marketplaceStats, setMarketplaceStats] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [pgsList, setPgsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const token = localStorage.getItem('staysmart_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, compRes, mktRes, revRes, usersRes, pgsRes] = await Promise.all([
        fetch('/api/analytics/overview', { headers }),
        fetch('/api/analytics/complaints', { headers }),
        fetch('/api/analytics/marketplace', { headers }),
        fetch('/api/analytics/reviews', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/pgs')
      ]);

      const [ovData, compData, mktData, revData, usersData, pgsData] = await Promise.all([
        ovRes.json(), compRes.json(), mktRes.json(), revRes.json(), usersRes.json(), pgsRes.json()
      ]);

      if (ovData.success) setOverview(ovData.stats);
      if (compData.success) setComplaintStats(compData.complaintStats);
      if (mktData.success) setMarketplaceStats(mktData.marketplaceStats);
      if (revData.success) setReviewStats(revData.reviewStats);
      if (usersData.success) setUsersList(usersData.users || []);
      if (pgsData.success) setPgsList(pgsData.data || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Admin analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleUpdateStatus = async (pgId, newStatus) => {
    try {
      await fetch(`/api/admin/pgs/${pgId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ status: newStatus })
      });
      setPgsList(prev => prev.map(p => (p._id || p.id) === pgId ? { ...p, status: newStatus } : p));
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const filteredUsers = usersList.filter(u =>
    !searchQuery || u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPGs = pgsList.filter(p =>
    !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ov = overview || {
    totalUsers: 340, totalStudents: 280, totalOwners: 60, totalPGs: 24,
    verifiedPGs: 22, pendingApprovals: 2, totalReviews: 148,
    totalComplaints: 32, occupancyRate: 88, totalRevenue: '₹14.8L/mo'
  };

  const adminNotifications = [
    { id: 'a1', title: '🚨 Scam Alert Detected', message: 'AI flagged 2 suspicious PG listings in Koramangala — review required.', time: '5m ago', type: 'error', icon: AlertTriangle },
    { id: 'a2', title: '✅ 4 PGs Verified Today', message: 'Automatic owner verification completed for 4 new listings.', time: '1h ago', type: 'success', icon: CheckCircle2 },
    { id: 'a3', title: '📊 Weekly Report Ready', message: 'Platform analytics summary for W32 is ready to export.', time: '2h ago', type: 'info', icon: FileText },
    { id: 'a4', title: '👥 15 New Registrations', message: 'BITS Pilani campus had the highest new user growth this week.', time: '4h ago', type: 'info', icon: Users },
  ];

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'complaints', label: '🔧 Complaints' },
    { id: 'marketplace', label: '🛒 Marketplace' },
    { id: 'reviews', label: '⭐ Reviews' },
    { id: 'moderation', label: '🛡️ Moderation' },
    { id: 'users', label: '👥 Users' },
    { id: 'ai', label: '🤖 AI Insights' },
  ];

  return (
    <div className="space-y-6 pb-20">

      {/* ── Admin Banner Header ── */}
      <div className="p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Platform Admin · Super Control Panel
            </div>
            <h1 className="text-3xl font-extrabold font-sans">StaySmart AI System Control</h1>
            <p className="text-xs text-slate-300 max-w-lg">
              Monitor platform health, manage PG listings, review user accounts, access complaint queues and AI-generated campus analytics.
            </p>
            <p className="text-[10px] text-amber-400/70">Last refreshed: {lastRefreshed.toLocaleTimeString()}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <NotificationCenter notifications={adminNotifications} />
            <button
              onClick={fetchAll}
              className="p-2.5 rounded-2xl bg-white/15 text-white border border-white/20 hover:bg-white/25 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-2xl bg-white text-slate-950 font-extrabold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-4 h-4 text-amber-600" /> Export Full Report
            </button>
          </div>
        </div>
      </div>

      {/* ── Top KPI Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Registered Users" value={ov.totalUsers} sub={`${ov.totalStudents} students · ${ov.totalOwners} owners`} color="#6366f1" icon={Users} trend="+12%" trendUp />
          <StatCard label="Active PG Listings" value={ov.totalPGs} sub={`${ov.verifiedPGs} verified`} color="#10b981" icon={Building2} trend="+3 this week" trendUp />
          <StatCard label="Pending Moderation" value={ov.pendingApprovals} sub="Awaiting admin review" color="#f59e0b" icon={Clock} />
          <StatCard label="Student Reviews" value={ov.totalReviews} sub="Avg 4.6★ platform rating" color="#8b5cf6" icon={Star} trend="+8%" trendUp />
          <StatCard label="Monthly Revenue" value={ov.totalRevenue} sub={`${ov.occupancyRate}% campus occupancy`} color="#0ea5e9" icon={TrendingUp} trend="+5%" trendUp />
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(t => (
          <TabBtn key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </TabBtn>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: OVERVIEW                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsChart
              title="User Role Distribution"
              subtitle="Breakdown of platform user types"
              items={[
                { category: 'Verified Students', count: ov.totalStudents, percentage: 82, color: '#6366f1' },
                { category: 'PG Owners / Landlords', count: ov.totalOwners, percentage: 18, color: '#8b5cf6' },
                { category: 'Admin Accounts', count: 2, percentage: 1, color: '#f59e0b' },
              ]}
            />
            <AnalyticsChart
              title="PG Listing Verification Status"
              subtitle="Health of campus housing supply"
              items={[
                { category: 'Verified & Published', count: ov.verifiedPGs, percentage: 92, color: '#10b981' },
                { category: 'Pending AI Verification', count: ov.pendingApprovals, percentage: 8, color: '#f59e0b' },
                { category: 'Rejected / Flagged', count: 0, percentage: 0, color: '#ef4444' },
              ]}
            />
          </div>

          {/* Platform Health Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Rent/mo', value: '₹9,240', icon: Building2, color: '#6366f1' },
              { label: 'PG Fill Rate', value: `${ov.occupancyRate}%`, icon: Activity, color: '#10b981' },
              { label: 'Complaints Resolved', value: '81%', icon: CheckCircle2, color: '#8b5cf6' },
              { label: 'AI Scam Detection', value: '98.4%', icon: ShieldCheck, color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}18` }}>
                  <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{item.value}</div>
                <div className="text-[11px] font-semibold text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <SectionHeading icon={Activity} iconColor="#6366f1">Recent Platform Activity</SectionHeading>
            <div className="space-y-3 text-xs">
              {[
                { time: '2 min ago', event: 'New PG listing submitted', detail: 'Green View PG, Koramangala — pending verification', dot: '#f59e0b' },
                { time: '15 min ago', event: 'Student Review Posted', detail: '"Excellent staff and clean rooms!" — Priya S. at UrbanNest PG', dot: '#10b981' },
                { time: '1 hr ago', event: 'AI Scam Alert Resolved', detail: 'Suspicious listing ID #PG-42 removed after owner verification failed', dot: '#ef4444' },
                { time: '3 hr ago', event: 'Community SOS Resolved', detail: 'Gas leak alert at BITS Pilani hostel marked resolved by admin team', dot: '#8b5cf6' },
                { time: '5 hr ago', event: 'Marketplace Spike Detected', detail: '48 new textbook listings in 2 hours — semester start detected', dot: '#6366f1' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.dot }} />
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.event}</span>
                    <span className="text-slate-500"> — {item.detail}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: COMPLAINTS                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Complaints', value: complaintStats?.totalComplaints || 32, color: '#6366f1', icon: FileText },
              { label: 'Resolved', value: complaintStats?.resolved || 26, color: '#10b981', icon: CheckCircle2 },
              { label: 'In Progress', value: complaintStats?.inProgress || 4, color: '#f59e0b', icon: Clock },
              { label: 'Avg Resolution', value: `${complaintStats?.averageResolutionHours || 14}h`, color: '#8b5cf6', icon: Activity },
            ].map((c, i) => <StatCard key={i} {...c} />)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Complaint Category Breakdown"
              subtitle="Distribution across all open & resolved tickets"
              items={complaintStats?.distribution || [
                { category: 'Maintenance & Plumbing', count: 14, percentage: 44, color: '#6366f1' },
                { category: 'Food & Mess Hygiene', count: 8, percentage: 25, color: '#f59e0b' },
                { category: 'Safety & Biometric Security', count: 6, percentage: 19, color: '#ef4444' },
                { category: 'Roommate & Noise Issues', count: 4, percentage: 12, color: '#10b981' },
              ]}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <SectionHeading icon={BarChart3} iconColor="#f59e0b">Resolution Rate Trend</SectionHeading>
              <div className="space-y-3">
                {[
                  { week: 'W29', resolved: 7, total: 9, color: '#10b981' },
                  { week: 'W30', resolved: 8, total: 10, color: '#10b981' },
                  { week: 'W31', resolved: 6, total: 8, color: '#f59e0b' },
                  { week: 'W32 (current)', resolved: 5, total: 5, color: '#10b981' },
                ].map((row, i) => {
                  const pct = Math.round((row.resolved / row.total) * 100);
                  return (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                        <span>{row.week}</span>
                        <span style={{ color: row.color }}>{row.resolved}/{row.total} resolved ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: row.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Complaints Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <SectionHeading icon={AlertTriangle} iconColor="#f59e0b">
                Open Complaint Tickets
                <span className="ml-2 text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                  {(complaintStats?.open || 6)} Open
                </span>
              </SectionHeading>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">PG Property</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {[
                  { id: '#TK-0118', cat: 'Plumbing / Water Leak', pg: 'UrbanNest Luxury PG', severity: 'High', status: 'Open' },
                  { id: '#TK-0117', cat: 'Biometric Lock Failure', pg: 'Sunrise Girls Hostel', severity: 'Critical', status: 'In Progress' },
                  { id: '#TK-0116', cat: 'Mess Food Hygiene', pg: 'HomeStay Point PG', severity: 'Medium', status: 'Open' },
                  { id: '#TK-0115', cat: 'Wi-Fi Connectivity', pg: 'Koramangala Boys PG', severity: 'Low', status: 'In Progress' },
                ].map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-mono font-bold text-slate-500">{t.id}</td>
                    <td className="p-4 font-semibold">{t.cat}</td>
                    <td className="p-4 text-slate-500">{t.pg}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.severity === 'Critical' ? 'bg-rose-500/10 text-rose-600' :
                        t.severity === 'High' ? 'bg-orange-500/10 text-orange-600' :
                        t.severity === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-emerald-500/10 text-emerald-600'
                      }`}>{t.severity}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        t.status === 'Open'
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>{t.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition-colors">Resolve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: MARKETPLACE                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Listings', value: marketplaceStats?.totalListings || 112, color: '#8b5cf6', icon: ShoppingBag },
              { label: 'Items Traded', value: marketplaceStats?.itemsTraded || 84, color: '#10b981', icon: CheckCircle2 },
              { label: 'Active Listings', value: marketplaceStats?.activeListings || 28, color: '#6366f1', icon: Activity },
              { label: 'Trade Volume', value: marketplaceStats?.tradeVolume || '₹2.4L', color: '#f59e0b', icon: TrendingUp },
            ].map((c, i) => <StatCard key={i} {...c} />)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Top Selling Marketplace Categories"
              subtitle="Volume of student items by product type"
              items={marketplaceStats?.categories || [
                { name: 'Study Materials & Books', count: 48, percentage: 43, color: '#6366f1' },
                { name: 'Study Tables & Chairs', count: 32, percentage: 28, color: '#8b5cf6' },
                { name: 'Mini-Fridges & Electronics', count: 20, percentage: 18, color: '#f59e0b' },
                { name: 'Bicycles & Scooters', count: 12, percentage: 11, color: '#10b981' },
              ]}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <SectionHeading icon={TrendingUp} iconColor="#8b5cf6">Trade Volume by Campus (Monthly)</SectionHeading>
              <div className="space-y-3 text-xs">
                {[
                  { campus: 'BITS Pilani', volume: '₹68,400', listings: 32, color: '#6366f1' },
                  { campus: 'IIT Delhi', volume: '₹54,200', listings: 24, color: '#8b5cf6' },
                  { campus: 'VIT Vellore', volume: '₹47,800', listings: 19, color: '#f59e0b' },
                  { campus: 'Delhi University', volume: '₹38,600', listings: 16, color: '#10b981' },
                  { campus: 'Pune University', volume: '₹28,000', listings: 11, color: '#0ea5e9' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex-1">{c.campus}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{c.volume}</span>
                    <span className="text-slate-400">{c.listings} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Fraud Flag Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <SectionHeading icon={ShieldCheck} iconColor="#ef4444">AI-Flagged Suspicious Listings</SectionHeading>
            <div className="space-y-3">
              {[
                { item: 'iPad Pro 12.9" (suspicious pricing)', seller: 'acc_92771', reason: 'Price 73% below market · Duplicate images detected', confidence: 96 },
                { item: 'MTech Reference Books Bundle', seller: 'acc_38841', reason: 'Account <3 days old · Same images as deleted listing', confidence: 88 },
              ].map((f, i) => (
                <div key={i} className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-rose-700 dark:text-rose-300">{f.item}</div>
                    <div className="text-slate-500">Seller: <span className="font-mono">{f.seller}</span></div>
                    <div className="text-rose-600 dark:text-rose-400">{f.reason}</div>
                  </div>
                  <div className="shrink-0 space-y-2 text-right">
                    <div className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">{f.confidence}% AI Confidence</div>
                    <button className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors block ml-auto">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: REVIEWS                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Reviews', value: reviewStats?.totalReviews || 184, color: '#f59e0b', icon: Star },
              { label: 'Platform Avg Rating', value: `${reviewStats?.averageRating || 4.6}★`, color: '#10b981', icon: Star },
              { label: 'Positive Sentiment', value: `${reviewStats?.sentimentSplit?.positivePct || 84}%`, color: '#6366f1', icon: TrendingUp },
              { label: 'Fake Reviews Flagged', value: reviewStats?.fakeReviewsFlagged || 6, color: '#ef4444', icon: AlertTriangle },
            ].map((c, i) => <StatCard key={i} {...c} />)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <SectionHeading icon={Star} iconColor="#f59e0b">Category Rating Averages (Platform-wide)</SectionHeading>
              <div className="space-y-3">
                {Object.entries(reviewStats?.categoryAverages || {
                  cleanliness: 4.6, food: 4.2, safety: 4.8, wifi: 4.4, value: 4.5
                }).map(([key, val]) => (
                  <RatingBar key={key} label={key} value={val} />
                ))}
              </div>
            </div>

            <AnalyticsChart
              title="Review Sentiment Distribution"
              subtitle="AI-analyzed tone across all submitted reviews"
              items={[
                { category: 'Positive (4-5★)', count: Math.round((reviewStats?.sentimentSplit?.positivePct || 84) * 1.84), percentage: reviewStats?.sentimentSplit?.positivePct || 84, color: '#10b981' },
                { category: 'Neutral (3★)', count: Math.round((reviewStats?.sentimentSplit?.neutralPct || 11) * 1.84), percentage: reviewStats?.sentimentSplit?.neutralPct || 11, color: '#f59e0b' },
                { category: 'Negative (1-2★)', count: Math.round((reviewStats?.sentimentSplit?.negativePct || 5) * 1.84), percentage: reviewStats?.sentimentSplit?.negativePct || 5, color: '#ef4444' },
              ]}
            />
          </div>

          {/* Flagged Reviews */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <SectionHeading icon={AlertTriangle} iconColor="#ef4444">
              AI-Flagged Suspicious Reviews
              <span className="ml-2 text-[10px] font-bold bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-full">
                {reviewStats?.fakeReviewsFlagged || 6} Flagged
              </span>
            </SectionHeading>
            <div className="space-y-3 text-xs">
              {[
                { pg: 'GreenView PG Koramangala', review: '"Best PG ever!! Perfect everything!!"', reason: 'Posted from owner IP · 5★ within 1h of listing', action: 'Remove' },
                { pg: 'Sunrise Girls Hostel', review: '"Bad food bad wifi bad everything"', reason: 'Duplicate text across 3 accounts · VPN detected', action: 'Remove' },
              ].map((r, i) => (
                <div key={i} className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{r.pg}</div>
                    <div className="text-slate-600 dark:text-slate-400 italic">"{r.review}"</div>
                    <div className="text-rose-600 dark:text-rose-400 font-semibold">🤖 AI: {r.reason}</div>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors shrink-0">{r.action}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: MODERATION                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search PGs…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <SectionHeading icon={Building2} iconColor="#6366f1">
                PG Property Moderation Queue ({filteredPGs.length})
              </SectionHeading>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Property Title</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Rent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredPGs.map((pg) => (
                  <tr key={pg._id || pg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold">{pg.title}</td>
                    <td className="p-4 text-slate-500">{pg.location}</td>
                    <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">₹{pg.pricePerMonth?.toLocaleString()}/mo</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        pg.status === 'approved' || !pg.status
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : pg.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        {pg.status || 'Approved'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(pg._id || pg.id, 'approved')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors"
                      >Approve</button>
                      <button
                        onClick={() => handleUpdateStatus(pg._id || pg.id, 'rejected')}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors"
                      >Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPGs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">No PG listings found.</div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: USERS                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <SectionHeading icon={Users} iconColor="#6366f1">
                Platform User Directory ({filteredUsers.length})
              </SectionHeading>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">University</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredUsers.map((u, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                          {u.name?.[0] || '?'}
                        </div>
                        <span className="font-bold">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{u.email}</td>
                    <td className="p-4">
                      <span className={`capitalize font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        u.role === 'admin' ? 'bg-amber-500/10 text-amber-600' :
                        u.role === 'owner' ? 'bg-purple-500/10 text-purple-600' :
                        'bg-indigo-500/10 text-indigo-600'
                      }`}>{u.role}</span>
                    </td>
                    <td className="p-4 text-slate-500">{u.university || '—'}</td>
                    <td className="p-4">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full text-[10px]">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">No users found.</div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: AI INSIGHTS                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* AI Health Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Scam Detection Accuracy', value: '98.4%', color: '#10b981', icon: ShieldCheck, trend: '+0.2%', trendUp: true },
              { label: 'Spam Post Catch Rate', value: '94.1%', color: '#6366f1', icon: Brain, trend: '+1.1%', trendUp: true },
              { label: 'Fake Review Precision', value: '91.7%', color: '#8b5cf6', icon: Star, trend: '-0.3%', trendUp: false },
              { label: 'Roommate Match Score', value: '87.3%', color: '#f59e0b', icon: Users, trend: '+2.4%', trendUp: true },
            ].map((c, i) => <StatCard key={i} {...c} />)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsChart
              title="AI Module Usage (This Month)"
              subtitle="How often each AI feature is invoked by users"
              items={[
                { category: 'Roommate Matcher', count: 1840, percentage: 100, color: '#6366f1' },
                { category: 'Spam Detector', count: 1520, percentage: 83, color: '#8b5cf6' },
                { category: 'Translation Engine', count: 1140, percentage: 62, color: '#0ea5e9' },
                { category: 'Marketplace Recommender', count: 980, percentage: 53, color: '#f59e0b' },
                { category: 'Scam Alerts', count: 640, percentage: 35, color: '#ef4444' },
                { category: 'Community Insights', count: 480, percentage: 26, color: '#10b981' },
              ]}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <SectionHeading icon={Sparkles} iconColor="#f59e0b">AI-Generated Campus Trend Report</SectionHeading>
              <div className="space-y-3 text-xs">
                {[
                  { emoji: '🏠', title: 'Rent Inflation Alert', detail: 'BITS Pilani area rents up 12% — AI recommends expanding verified listing partnerships.', color: '#f59e0b' },
                  { emoji: '🎓', title: 'Semester Move-in Surge', detail: 'AI predicts 40% traffic spike in next 3 weeks. Pre-approve verified PGs now.', color: '#6366f1' },
                  { emoji: '📦', title: 'Marketplace Demand Spike', detail: 'Textbook demand up 380% — AI suggests running a semester textbook exchange event.', color: '#8b5cf6' },
                  { emoji: '🔒', title: 'Safety Concern Cluster', detail: '3 complaints from Laxmi Nagar area. AI suggests on-ground safety audit.', color: '#ef4444' },
                  { emoji: '🤝', title: 'Roommate Success Rate', detail: '78% of AI-matched roommate pairs reported high satisfaction after 30 days.', color: '#10b981' },
                ].map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: `${insight.color}0a`, border: `1px solid ${insight.color}20` }}>
                    <span className="text-lg shrink-0">{insight.emoji}</span>
                    <div>
                      <div className="font-extrabold text-slate-800 dark:text-slate-200" style={{ color: insight.color }}>{insight.title}</div>
                      <div className="text-slate-500 mt-0.5 leading-relaxed">{insight.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Performance */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <SectionHeading icon={Brain} iconColor="#6366f1">AI Model Performance Metrics</SectionHeading>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {[
                { name: 'Spam Detection Model', version: 'v2.4.1', accuracy: '94.1%', status: 'Healthy', latency: '38ms' },
                { name: 'Scam Alert Engine', version: 'v3.1.0', accuracy: '98.4%', status: 'Healthy', latency: '52ms' },
                { name: 'Sentiment Analyzer', version: 'v1.8.3', accuracy: '91.7%', status: 'Healthy', latency: '29ms' },
                { name: 'Roommate Matcher', version: 'v2.0.2', accuracy: '87.3%', status: 'Healthy', latency: '112ms' },
                { name: 'Translation Engine', version: 'v4.2.0', accuracy: '99.1%', status: 'Healthy', latency: '64ms' },
                { name: 'Category Detector', version: 'v1.3.7', accuracy: '92.8%', status: 'Healthy', latency: '18ms' },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{m.name}</div>
                  <div className="text-slate-400 font-mono text-[9px]">{m.version}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{m.accuracy}</span>
                    <span className="text-slate-400">{m.latency} avg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
