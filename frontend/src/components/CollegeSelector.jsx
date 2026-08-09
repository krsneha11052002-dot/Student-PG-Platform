import React, { useState, useRef, useEffect } from 'react';
import { DELHI_COLLEGES, useCollege } from '../context/CollegeContext';
import { GraduationCap, ChevronDown, Search, X, MapPin, RefreshCw } from 'lucide-react';

/**
 * CollegeChip — small badge showing selected college in Navbar / anywhere
 */
export const CollegeChip = ({ onClick }) => {
  const { selectedCollege } = useCollege();
  if (!selectedCollege) return null;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all hover:opacity-80"
      style={{
        background: `${selectedCollege.color}15`,
        borderColor: `${selectedCollege.color}40`,
        color: selectedCollege.color
      }}
    >
      <span className="text-sm leading-none">{selectedCollege.emoji}</span>
      <span className="hidden sm:inline">{selectedCollege.shortName}</span>
    </button>
  );
};

/**
 * CollegeSearchDropdown — standalone searchable college picker
 */
export const CollegeSearchDropdown = ({ value, onChange, placeholder = 'Select your college...' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = DELHI_COLLEGES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.shortName.toLowerCase().includes(query.toLowerCase()) ||
    c.area.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (college) => {
    onChange(college);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-left transition-all hover:border-indigo-400 focus:outline-none focus:border-indigo-500"
      >
        {value ? (
          <div className="flex items-center gap-2">
            <span>{value.emoji}</span>
            <span className="font-semibold text-slate-900 dark:text-white">{value.name}</span>
          </div>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search college..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border-none focus:outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map(college => (
              <button
                key={college.id}
                type="button"
                onClick={() => handleSelect(college)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${value?.id === college.id ? 'bg-indigo-50 dark:bg-indigo-950/50' : ''}`}
              >
                <span className="text-base">{college.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">{college.name}</div>
                  <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5" />{college.area}
                  </div>
                </div>
                {value?.id === college.id && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">No match found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
