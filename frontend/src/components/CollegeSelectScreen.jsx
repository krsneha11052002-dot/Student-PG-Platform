import React, { useState, useRef, useEffect } from 'react';
import { DELHI_COLLEGES, useCollege } from '../context/CollegeContext';
import {
  GraduationCap, Search, MapPin, ChevronRight, Sparkles, Building2,
  CheckCircle2, ArrowRight, Star, Users, BookOpen, Zap
} from 'lucide-react';

export const CollegeSelectScreen = ({ onComplete }) => {
  const { chooseCollege } = useCollege();
  const [query, setQuery] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [step, setStep] = useState('choose'); // 'choose' | 'confirm'
  const [pendingCollege, setPendingCollege] = useState(null);
  const [customName, setCustomName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = DELHI_COLLEGES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.shortName.toLowerCase().includes(query.toLowerCase()) ||
    c.area.toLowerCase().includes(query.toLowerCase()) ||
    c.zone.toLowerCase().includes(query.toLowerCase()) ||
    c.type.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (college) => {
    setPendingCollege(college);
    setStep('confirm');
  };

  const handleConfirm = () => {
    let finalCollege = { ...pendingCollege };
    if (pendingCollege.id === 'other') {
      if (!customName.trim()) {
        alert("Please enter your college name");
        return;
      }
      finalCollege.name = customName.trim();
      finalCollege.shortName = customName.trim().split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 8) || 'Custom';
    }
    chooseCollege(finalCollege);
    if (onComplete) onComplete(finalCollege);
  };

  const typeColors = {
    'IIT': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'Central University': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'DU College': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    'DU College (Girls)': 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    'Engineering (Women)': 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    'Engineering': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    'Medical Institute': 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    'Private University': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'Private Engineering': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'State University': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'Law College': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    'Other': 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
  };

  if (step === 'confirm' && pendingCollege) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          
          {/* College header with color band */}
          <div className="h-2 w-full" style={{ background: `linear-gradient(to right, ${pendingCollege.color}, ${pendingCollege.color}88)` }} />

          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">{pendingCollege.emoji}</div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {pendingCollege.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {pendingCollege.area}, {pendingCollege.zone}
              </p>
            </div>

            {pendingCollege.id === 'other' && (
              <div className="space-y-1.5 text-left max-w-sm mx-auto">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Enter Your College/University Name:
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Christ University / SRM Chennai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs font-semibold shadow-sm"
                />
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your personalized experience will include:
              </p>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  PGs & hostels near <strong>{pendingCollege.area}</strong>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Reviews from <strong>{pendingCollege.shortName}</strong> students only
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Roommate matching with <strong>{pendingCollege.shortName}</strong> peers
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  College-specific community & marketplace
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                ← Go Back
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${pendingCollege.color}, ${pendingCollege.color}cc)` }}
              >
                <Sparkles className="w-4 h-4" /> Confirm College
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-10 pb-6 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 text-xs font-bold px-4 py-1.5 rounded-full border border-indigo-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          StaySmart AI — Personalised for Your Campus
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">College</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Everything on StaySmart AI — PGs, reviews, roommates, community — becomes <strong className="text-slate-200">hyper-local to your campus</strong>.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {[
            { icon: Building2, label: 'Nearby PGs' },
            { icon: Star, label: 'College Reviews' },
            { icon: Users, label: 'Roommates' },
            { icon: BookOpen, label: 'Community' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 bg-slate-800/80 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700/60">
              <Icon className="w-3 h-3 text-indigo-400" /> {label}
            </span>
          ))}
        </div>
      </div>

      {/* Search Box */}
      <div className="relative z-10 px-4 max-w-2xl mx-auto w-full mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search college, area, or type (e.g. IIT, Kamla Nagar, Engineering)..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all shadow-xl"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-semibold"
            >
              Clear
            </button>
          )}
        </div>
        {filtered.length > 0 && query && (
          <div className="mt-1 text-xs text-slate-500 text-right px-1">
            {filtered.length} college{filtered.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Colleges List */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-8 max-w-2xl mx-auto w-full">
        
        {/* Group by zone */}
        {!query && (
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3 pl-1">
            All Delhi / NCR Colleges ({DELHI_COLLEGES.length - 1} + Other)
          </p>
        )}

        <div className="space-y-2">
          {filtered.map((college) => (
            <button
              key={college.id}
              onClick={() => handleSelect(college)}
              onMouseEnter={() => setHoveredId(college.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 group ${
                hoveredId === college.id
                  ? 'bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/10 scale-[1.01]'
                  : 'bg-slate-900/80 border-slate-800/60 hover:border-slate-700'
              }`}
            >
              {/* College color accent + emoji */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-md"
                style={{ background: `${college.color}22`, border: `1px solid ${college.color}44` }}
              >
                {college.emoji}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm truncate">{college.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${typeColors[college.type] || typeColors['Other']}`}>
                    {college.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                  <span>{college.area} · {college.zone}</span>
                </div>
                {college.nearbyAreas.length > 0 && (
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className="text-slate-600">Nearby:</span>
                    {college.nearbyAreas.slice(0, 3).join(' · ')}
                    {college.nearbyAreas.length > 3 && ` +${college.nearbyAreas.length - 3} more`}
                  </div>
                )}
              </div>

              <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${hoveredId === college.id ? 'text-indigo-400 translate-x-1' : 'text-slate-600'}`} />
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl">🔍</div>
            <p className="text-slate-400 text-sm">No college found for "{query}"</p>
            <button
              onClick={() => handleSelect(DELHI_COLLEGES.find(c => c.id === 'other'))}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold underline"
            >
              Select "Other College (Not Listed)"
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
