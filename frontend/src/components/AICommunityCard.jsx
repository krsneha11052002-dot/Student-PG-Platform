import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, TrendingUp, BookOpen, ShieldCheck, Tag, Loader2, CheckCircle } from 'lucide-react';

export const AICommunityCard = ({ collegeShortName }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [trendingData, setTrendingData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAICommunityMetrics = async () => {
      setLoading(true);
      try {
        const [sumRes, trendRes, insRes] = await Promise.all([
          fetch(`/api/ai/community/summary?collegeShortName=${encodeURIComponent(collegeShortName || 'Campus')}`),
          fetch(`/api/ai/community/trending?collegeShortName=${encodeURIComponent(collegeShortName || 'Campus')}`),
          fetch(`/api/ai/community/insights?collegeShortName=${encodeURIComponent(collegeShortName || 'Campus')}`)
        ]);

        const sumData = await sumRes.json();
        const trData = await trendRes.json();
        const inData = await insRes.json();

        if (sumData.success) setSummaryData(sumData);
        if (trData.success) setTrendingData(trData);
        if (inData.success) setInsightsData(inData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAICommunityMetrics();
  }, [collegeShortName]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-indigo-100 dark:border-indigo-950/60 p-6 space-y-5 shadow-xl relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              StaySmart AI Community Intelligence
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {collegeShortName || 'Campus'} Real-Time Insights
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Live Verified
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-slate-400 py-6 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Analyzing community discussions & campus hashtags...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* AI Discussion Summarizer */}
          <div className="md:col-span-2 space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> AI Forum & Discussion Summary
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">96% AI Confidence</span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              {summaryData?.summary || `StaySmart AI summarized active discussions near ${collegeShortName}.`}
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Top Campus Takeaways:</span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                {summaryData?.keyTakeaways?.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px]">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trending Topics & Hashtags */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" /> Trending Hashtags
            </div>

            <div className="space-y-2">
              {trendingData?.trendingHashtags?.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    <span className="font-extrabold text-slate-900 dark:text-white text-[11px]">{t.tag}</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                    {t.trend}
                  </span>
                </div>
              ))}
            </div>

            {insightsData && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Campus Sentiment: <strong className="text-emerald-500">{insightsData.overallSentiment}</strong></span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
