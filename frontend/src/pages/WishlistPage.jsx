import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCollege } from '../context/CollegeContext';
import { PGCard } from '../components/PGCard';
import { Heart, Search, Building2, SlidersHorizontal, RefreshCw } from 'lucide-react';

export const WishlistPage = ({ setSelectedPGId, setCurrentTab }) => {
  const { user } = useAuth();
  const { selectedCollege, changeCollege } = useCollege();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pgs/wishlist', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('staysmart_token')}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(data.data);
      }
    } catch (err) {
      console.error('Fetch wishlist error:', err);
      // Fallback: fetch all pgs and filter locally using user.savedPGs
      try {
        const res = await fetch('/api/pgs');
        const data = await res.json();
        if (data.success) {
          const savedIds = user?.savedPGs || [];
          setWishlist(data.data.filter((pg) => savedIds.includes(pg._id || pg.id)));
        }
      } catch (e) {
        console.error('Fallback fetch wishlist error:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const collegeColor = selectedCollege?.color || '#4f46e5';

  return (
    <div className="space-y-6 pb-16">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            My Saved Accommodations Wishlist
          </h1>
          {selectedCollege && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Filtered for <strong>{selectedCollege.shortName}</strong> zone
              </span>
              <button
                onClick={changeCollege}
                className="text-xs font-semibold flex items-center gap-1 hover:underline"
                style={{ color: collegeColor }}
              >
                🔄 Change College
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setCurrentTab('search')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Search className="w-4 h-4" /> Explore More PGs
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save accommodations to your wishlist to keep track of them and compare options side-by-side.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('search')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            Find PGs &amp; Hostels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((pg) => (
            <PGCard
              key={pg._id || pg.id}
              pg={pg}
              onSelect={() => {
                setSelectedPGId(pg._id || pg.id);
                setCurrentTab('pg-detail');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
