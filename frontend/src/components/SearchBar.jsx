import React, { useState } from 'react';
import { Search, Sparkles, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { useCollege } from '../context/CollegeContext';

export const SearchBar = ({ onSearch, placeholder, initialValue = '', showFilterBtn = false, onToggleFilters }) => {
  const { selectedCollege } = useCollege();
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const quickTags = [
    selectedCollege?.area ? `Near ${selectedCollege.shortName}` : 'North Campus',
    'Girls PG',
    'Single Room',
    'Under ₹8,000',
    'Free Wi-Fi & Mess'
  ];

  return (
    <div className="w-full relative space-y-2">
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center rounded-2xl glass-panel transition-all duration-300 ${
          isFocused ? 'ring-2 ring-indigo-500/50 shadow-xl border-indigo-400/50' : 'shadow-md hover:shadow-lg'
        }`}
      >
        <div className="pl-4 text-indigo-500 shrink-0">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || `Search PGs near ${selectedCollege?.shortName || 'campus'}, area, or amenities...`}
          className="w-full py-3.5 px-3 bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {showFilterBtn && (
          <button
            type="button"
            onClick={onToggleFilters}
            className="mr-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        )}

        <button
          type="submit"
          className="mr-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Search
        </button>
      </form>

      {/* Quick Search Tag Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold text-slate-500">
        <span className="shrink-0 flex items-center gap-1 text-indigo-500 font-bold">
          <Sparkles className="w-3 h-3" /> Quick Filter:
        </span>
        {quickTags.map((tag, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(tag);
              if (onSearch) onSearch(tag);
            }}
            className="shrink-0 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all backdrop-blur-sm"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
