import React, { useState, useEffect } from 'react';
import { PGCard } from '../components/PGCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { SearchBar } from '../components/SearchBar';
import { useCollege } from '../context/CollegeContext';
import { 
  Search, Sparkles, Building2, ShieldCheck, Users, Star, 
  ArrowRight, CheckCircle2, Heart, Bot, MapPin, RefreshCw,
  MessageSquare, ShoppingBag, GraduationCap, Zap, Lock, ChevronRight
} from 'lucide-react';

export const HomePage = ({ setCurrentTab, onSelectPG }) => {
  const { selectedCollege, changeCollege } = useCollege();
  const [featuredPGs, setFeaturedPGs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPGs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCollege && selectedCollege.nearbyAreas.length > 0) {
          params.append('search', selectedCollege.area);
        }
        const res = await fetch(`/api/pgs?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setFeaturedPGs(data.data);
        }
      } catch (err) {
        console.warn('Fetch PGs error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPGs();
  }, [selectedCollege]);

  const handleHeroSearch = (term) => {
    setCurrentTab('search');
  };

  const collegeColor = selectedCollege?.color || '#4f46e5';

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-300">
      
      {/* Personalized College Banner */}
      {selectedCollege && (
        <div
          className="p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-xl relative overflow-hidden transition-all"
          style={{ background: `linear-gradient(135deg, ${collegeColor}ff, ${collegeColor}aa)` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <span className="text-4xl animate-bounce-soft">{selectedCollege.emoji}</span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-white/80 mb-0.5">
                🎓 Campus Experience Active
              </div>
              <div className="font-black text-xl leading-tight font-sans">{selectedCollege.name}</div>
              <div className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                Showing verified student PGs near {selectedCollege.area} · {selectedCollege.zone}
              </div>
            </div>
          </div>
          <button
            onClick={changeCollege}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-extrabold text-xs transition-all relative z-10 shadow-md backdrop-blur-md"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Change College
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 rounded-3xl bg-gradient-to-b from-indigo-900/10 via-purple-900/5 to-transparent border border-slate-200/50 dark:border-slate-800/50">
        
        {/* Floating background ambient blurs */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black shadow-sm animate-fade-in-down">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>AI-POWERED VERIFIED STUDENT ACCOMMODATIONS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] font-sans">
            Find Your Ideal <span className="gradient-text">Student PG & Roommate</span> Near Campus
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Direct owner listings, zero broker fees, verified student reviews, AI roommate matching, and 24/7 college community support.
          </p>

          {/* Large Hero Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <SearchBar onSearch={handleHeroSearch} showFilterBtn onToggleFilters={() => setCurrentTab('search')} />
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl glass-card text-center space-y-1">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">100%</div>
              <div className="text-[11px] font-bold text-slate-500">Zero Brokerage</div>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center space-y-1">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">2,400+</div>
              <div className="text-[11px] font-bold text-slate-500">Verified Students</div>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center space-y-1">
              <div className="text-2xl font-black text-amber-500">98.4%</div>
              <div className="text-[11px] font-bold text-slate-500">AI Match Score</div>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center space-y-1">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">4.8★</div>
              <div className="text-[11px] font-bold text-slate-500">Avg Rating</div>
            </div>
          </div>

        </div>
      </section>

      {/* AI Features Highlight Strip */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-500" /> AI Campus Superpowers
            </h2>
            <p className="text-xs text-slate-500 font-medium">Smart AI assistants designed specifically for university life.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentTab('roommates')}
            className="p-6 rounded-3xl glass-card hover:shadow-xl hover:border-indigo-500/50 transition-all text-left group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
              AI Roommate Matcher
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Match with peers by study habits, sleep schedule, department, and lifestyle.
            </p>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              Find Match <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('community')}
            className="p-6 rounded-3xl glass-card hover:shadow-xl hover:border-purple-500/50 transition-all text-left group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
              AI Forum Summarizer
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get instant key takeaways from 100+ daily student discussions in seconds.
            </p>
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              View Hub <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('marketplace')}
            className="p-6 rounded-3xl glass-card hover:shadow-xl hover:border-emerald-500/50 transition-all text-left group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              AI Fraud & Scam Shield
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI scans marketplace items and reviews to block suspicious pricing & fake accounts.
            </p>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              Shop Marketplace <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('reviews')}
            className="p-6 rounded-3xl glass-card hover:shadow-xl hover:border-amber-500/50 transition-all text-left group space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
              Verified Student Reviews
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real ratings on food quality, Wi-Fi speed, safety, and landlord responsiveness.
            </p>
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              Read Reviews <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </section>

      {/* Featured PG Accommodations Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-500" /> Featured PG Listings
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Hand-picked verified accommodations near {selectedCollege?.shortName || 'campus'}.
            </p>
          </div>
          
          <button
            onClick={() => setCurrentTab('search')}
            className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-extrabold text-xs hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
          >
            View All PGs ({featuredPGs.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <SkeletonCard count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPGs.slice(0, 6).map((pg) => (
              <PGCard key={pg._id || pg.id} pg={pg} onSelect={onSelectPG} />
            ))}
          </div>
        )}
      </section>

      {/* Trust & Safety Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Student Verified Platform
            </div>
            <h2 className="text-3xl font-black">Stay Safe with StaySmart AI</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Every landlord and student account is verified via biometric or student ID. Zero hidden broker charges, automated rental contracts, and 24/7 campus emergency SOS alert dispatch.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('community')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Join Campus Hub
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
