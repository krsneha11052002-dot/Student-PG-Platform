import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, AlertTriangle, Languages, TrendingDown, BookOpen, Check, HelpCircle, Loader2 } from 'lucide-react';

export const AIInsightsCard = ({ pg, reviews, onTranslateReview }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [rentData, setRentData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [rentLoading, setRentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedLang, setSelectedLang] = useState('en');
  const [translatingReviewId, setTranslatingReviewId] = useState(null);

  // Fetch AI review summary
  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`/api/ai/reviews/${pg._id || pg.id}/summary`);
      const data = await res.json();
      if (data.success) {
        setSummaryData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch AI rent analysis
  const fetchRentAnalysis = async () => {
    setRentLoading(true);
    try {
      const res = await fetch(`/api/ai/rent-analysis/${pg._id || pg.id}`);
      const data = await res.json();
      if (data.success) {
        setRentData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRentLoading(false);
    }
  };

  useEffect(() => {
    if (pg) {
      fetchSummary();
      fetchRentAnalysis();
    }
  }, [pg]);

  // Translate a review
  const handleTranslate = async (reviewId, text) => {
    if (selectedLang === 'en') {
      onTranslateReview && onTranslateReview(reviewId, text); // reset
      return;
    }
    setTranslatingReviewId(reviewId);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: selectedLang })
      });
      const data = await res.json();
      if (data.success) {
        onTranslateReview && onTranslateReview(reviewId, data.translated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTranslatingReviewId(null);
    }
  };

  const getSafetyColor = (score) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 80) return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative backdrop elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-4.5 h-4.5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              StaySmart AI Insights
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Algorithmic Auditing</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20">
          Live Model Active
        </span>
      </div>

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-3 gap-3">
        {/* Safety Score */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/50 text-center space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">AI Safety</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {pg.aiSafetyScore || 85}%
          </div>
          <span className="text-[9px] font-bold text-emerald-500">Secure Zones</span>
        </div>

        {/* PG Score Grade */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/50 text-center space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Value Grade</span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {pg.aiPgScore || 'A'}
          </div>
          <span className="text-[9px] text-slate-400 block">Price vs Assets</span>
        </div>

        {/* Scam Probability */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/50 text-center space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Scam Risk</span>
          <div className={`text-xl font-extrabold ${pg.aiScamScore > 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {pg.aiScamScore || 2}%
          </div>
          <span className="text-[9px] text-slate-400 block">Verified Owner</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-850/50 text-xs">
        {[
          { key: 'summary', label: 'Review Summarizer', icon: BookOpen },
          { key: 'rent', label: 'Fair Rent Audit', icon: TrendingDown },
          { key: 'translation', label: 'Translation Hub', icon: Languages }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1 px-3 py-2 border-b-2 -mb-[1px] font-bold transition-all ${
              activeTab === key
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="text-xs">
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {summaryLoading ? (
              <div className="flex items-center gap-2 text-slate-400 py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Generating summary points...</span>
              </div>
            ) : summaryData ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  {summaryData.summary}
                </p>

                {/* Pros & Cons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Pros</span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                      {summaryData.pros?.map((pro, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px]">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Cons / Limitations</span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                      {summaryData.cons?.length > 0 ? (
                        summaryData.cons.map((con, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400 text-[10px]">No major cons flagged.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-6">No summary loaded.</p>
            )}
          </div>
        )}

        {activeTab === 'rent' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {rentLoading ? (
              <div className="flex items-center gap-2 text-slate-400 py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Auditing baseline rent...</span>
              </div>
            ) : rentData ? (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Audit Verdict:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                    rentData.differencePercentage <= 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20'
                  }`}>
                    {rentData.status}
                  </span>
                </div>
                
                {/* Visual Gauge Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>Rent: ₹{rentData.price}</span>
                    <span>Zone Average: ₹{rentData.baseline}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full ${
                        rentData.differencePercentage <= 0 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(Math.max(((rentData.price / (rentData.baseline * 1.5)) * 100), 20), 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1.5 border-t border-slate-200/50 dark:border-slate-800">
                  {rentData.analysis}
                </p>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-6">Rent analysis missing.</p>
            )}
          </div>
        )}

        {activeTab === 'translation' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-3">
              <p className="text-slate-500">Translate student review entries instantly:</p>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
              >
                <option value="en">English (Default)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {reviews.slice(0, 2).map((rev) => (
                <div key={rev._id || rev.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold">{rev.userName}</span>
                    <span>Review comment</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">"{rev.comment}"</p>
                  
                  {selectedLang !== 'en' && (
                    <button
                      onClick={() => handleTranslate(rev._id || rev.id, rev.comment)}
                      disabled={translatingReviewId === (rev._id || rev.id)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 mt-1 hover:underline"
                    >
                      {translatingReviewId === (rev._id || rev.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Languages className="w-3 h-3" />
                      )}
                      <span>Translate to {selectedLang.toUpperCase()}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
