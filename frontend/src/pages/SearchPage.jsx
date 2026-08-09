import React, { useState, useEffect } from 'react';
import { PGCard } from '../components/PGCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { SearchBar } from '../components/SearchBar';
import { useCollege } from '../context/CollegeContext';
import { 
  Search, SlidersHorizontal, RefreshCcw, Building2, MapPin, 
  GraduationCap, Filter, X, Check, ArrowUpDown, Sparkles 
} from 'lucide-react';

export const SearchPage = ({ onSelectPG }) => {
  const { selectedCollege } = useCollege();
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('All');
  const [roomType, setRoomType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(25000);
  const [sort, setSort] = useState('latest');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const amenityOptions = [
    'High-Speed Wi-Fi', 'Air Conditioning', '3-Time Meals included',
    '24/7 Security CCTV', 'Biometric Entry', 'Daily Housekeeping', 'Power Backup'
  ];

  const fetchFilteredPGs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      else if (selectedCollege?.area) params.append('search', selectedCollege.area);

      if (gender !== 'All') params.append('gender', gender);
      if (roomType !== 'All') params.append('roomType', roomType);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);
      if (selectedAmenities.length > 0) params.append('amenities', selectedAmenities.join(','));

      const res = await fetch(`/api/pgs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPgs(data.data);
      }
    } catch (err) {
      console.error('Fetch filter PGs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredPGs();
  }, [search, gender, roomType, maxPrice, sort, selectedAmenities]);

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setGender('All');
    setRoomType('All');
    setMaxPrice(25000);
    setSort('latest');
    setSelectedAmenities([]);
  };

  const collegeColor = selectedCollege?.color || '#4f46e5';

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Browse Student PGs <span className="text-indigo-500 font-extrabold text-lg">({pgs.length})</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {selectedCollege 
                ? `Filtered for ${selectedCollege.shortName} · ${selectedCollege.area}` 
                : 'Find verified student accommodations across all campus locations.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden px-4 py-2.5 rounded-xl glass-panel text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2"
            >
              <Filter className="w-4 h-4 text-indigo-500" /> Filters
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="latest">Latest Listed</option>
                <option value="price_low">Rent: Low to High</option>
                <option value="price_high">Rent: High to Low</option>
                <option value="rating">Highest Rated ★</option>
              </select>
            </div>
          </div>
        </div>

        <SearchBar 
          onSearch={(val) => setSearch(val)} 
          initialValue={search}
          placeholder="Search by area, PG title, or amenity (e.g. Koramangala, Wi-Fi)..." 
        />
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Filter Sidebar (Desktop & Mobile Drawer) */}
        <aside className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} space-y-6 glass-card p-6 rounded-3xl sticky top-24 z-20`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" /> Refine Search
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">PG Category</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              {['All', 'Girls Only', 'Boys Only'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-2 px-2 rounded-xl border text-center transition-all ${
                    gender === g
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {g.replace(' Only', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Room Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Occupancy Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Room Types</option>
              <option value="Single Room">Single Private Room</option>
              <option value="2 Sharing">2 Sharing Deluxe</option>
              <option value="3 Sharing">3 Sharing Budget</option>
            </select>
          </div>

          {/* Max Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Max Monthly Rent</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="4000"
              max="25000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>₹4,000</span>
              <span>₹25,000</span>
            </div>
          </div>

          {/* Amenities Multi-select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Must-Have Amenities</label>
            <div className="space-y-1.5">
              {amenityOptions.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      checked
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <SkeletonCard count={6} />
          ) : pgs.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">No PGs match your criteria</h3>
                <p className="text-xs text-slate-500 font-medium">Try increasing your rent slider or resetting active amenity filters.</p>
              </div>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pgs.map((pg) => (
                <PGCard key={pg._id || pg.id} pg={pg} onSelect={onSelectPG} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
