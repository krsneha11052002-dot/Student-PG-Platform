import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCollege } from '../context/CollegeContext';
import { PGCard } from '../components/PGCard';
import { NotificationCenter } from '../components/NotificationCenter';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { 
  UserCheck, Heart, Sparkles, Star, Building2, Search, 
  Users, MessageSquare, ShoppingBag, GraduationCap, MapPin, ArrowRight, RefreshCw, Download
} from 'lucide-react';

export const StudentDashboard = ({ setCurrentTab, onSelectPG }) => {
  const { user } = useAuth();
  const { selectedCollege, changeCollege } = useCollege();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPGs = async () => {
      try {
        const res = await fetch('/api/pgs');
        const data = await res.json();
        if (data.success) {
          const userSavedIds = user?.savedPGs || ['pg_1', 'pg_3'];
          const matched = data.data.filter(p => userSavedIds.includes(p._id || p.id));
          setSavedListings(matched.length > 0 ? matched : data.data.slice(0, 2));
        }
      } catch (err) {
        console.error('Fetch saved PGs error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPGs();
  }, [user]);

  const collegeColor = selectedCollege?.color || '#4f46e5';

  return (
    <div className="space-y-8 pb-16">
      
      {/* Student Welcome Header Card */}
      <div className="p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #1e1b4b, #312e81, ${selectedCollege?.color || '#4f46e5'}88)` }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 translate-x-24 pointer-events-none" />

        <div className="space-y-3 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Verified Student ID Active
            </div>
            {selectedCollege && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold border border-white/20">
                <span>{selectedCollege.emoji}</span> {selectedCollege.shortName} Student
              </div>
            )}
          </div>
          <h1 className="text-3xl font-extrabold font-sans">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-xs text-indigo-200 max-w-xl">
            {selectedCollege
              ? `${selectedCollege.name} · ${selectedCollege.area}. `
              : user?.university ? `Enrolled at ${user.university}. ` : ''}
            Manage your saved PG wishlist, post student reviews, and unlock AI roommate suggestions.
          </p>
        </div>

        <div className="flex flex-col gap-2 z-10 shrink-0">
          <div className="flex items-center gap-2 justify-end">
            <NotificationCenter />
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-2xl bg-white/20 text-white font-bold text-xs border border-white/20 hover:bg-white/30 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Housing Summary
            </button>
          </div>
          <button
            onClick={() => setCurrentTab('search')}
            className="px-5 py-2.5 rounded-2xl bg-white text-slate-950 font-bold text-xs shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Search PGs Near {selectedCollege?.shortName || 'Campus'}
          </button>
          {selectedCollege && (
            <button
              onClick={changeCollege}
              className="px-4 py-2 rounded-xl bg-white/15 text-white/90 font-semibold text-xs border border-white/20 hover:bg-white/25 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Change College
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setCurrentTab('wishlist')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 hover:shadow-md transition-all text-left flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Heart className="w-6 h-6 fill-red-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{savedListings.length}</div>
            <div className="text-xs text-slate-500 font-medium">Saved PG Favorites</div>
          </div>
        </button>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">2 Reviews</div>
            <div className="text-xs text-slate-500 font-medium">Submitted PG Reviews</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">98% Match</div>
            <div className="text-xs text-slate-500 font-medium">AI Roommate Score</div>
          </div>
        </div>
      </div>

      {/* College Hub Quick Access */}
      {selectedCollege && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentTab('community')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-indigo-400/50 transition-all text-left flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {selectedCollege.shortName} Community
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Roommates, tips &amp; alerts</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 ml-auto group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => setCurrentTab('marketplace')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-purple-400/50 transition-all text-left flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {selectedCollege.shortName} Marketplace
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Buy &amp; sell with campus peers</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 ml-auto group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => setCurrentTab('roommates')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-emerald-400/50 transition-all text-left flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Find Roommates
              </div>
              <div className="text-xs text-slate-500 mt-0.5">AI-matched {selectedCollege.shortName} peers</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 ml-auto group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => setCurrentTab('reviews')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-amber-400/50 transition-all text-left flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                PG Reviews
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Verified {selectedCollege.shortName} reviews</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 ml-auto group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      )}

      {/* AI Roommate Match Preview Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-indigo-900/50 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg font-bold">StaySmart AI Roommate Matcher</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            Active Profile
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {selectedCollege
            ? `Matching with <strong>${selectedCollege.shortName}</strong> students: `
            : 'Your AI preferences: '}
          <span className="text-indigo-300 font-semibold">Night Owl • Quiet Study • Non-Smoker • CS Engineering</span>. 
          {selectedCollege 
            ? ` Found 12 compatible roommates near ${selectedCollege.area}.`
            : ' We have automatically ranked local PGs with matching student roommate profiles.'}
        </p>
      </div>

      {/* Saved PGs Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Your Saved PG Wishlist
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : savedListings.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No PGs saved yet. Click the heart icon on any PG card to bookmark accommodations!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map((pg) => (
              <PGCard key={pg._id || pg.id} pg={pg} onSelect={onSelectPG} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
