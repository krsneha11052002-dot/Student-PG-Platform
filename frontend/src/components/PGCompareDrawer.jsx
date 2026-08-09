import React, { useState, useEffect } from 'react';
import { useCompare } from '../context/CompareContext';
import { X, SlidersHorizontal, Check, Minus, Building } from 'lucide-react';

export const PGCompareDrawer = ({ setCurrentTab, setSelectedPGId }) => {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  const [showModal, setShowModal] = useState(false);
  const [pgList, setPgList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareIds.length === 0) {
      setShowModal(false);
      return;
    }

    if (showModal) {
      const fetchComparePGs = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/pgs/compare?ids=${compareIds.join(',')}`);
          const data = await res.json();
          if (data.success) {
            setPgList(data.data);
          }
        } catch (err) {
          console.error('Error fetching compare list:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchComparePGs();
    }
  }, [compareIds, showModal]);

  if (compareIds.length === 0) return null;

  // Gather all unique amenities across all compared PGs
  const allAmenities = Array.from(
    new Set(pgList.flatMap((pg) => pg.amenities || []))
  );

  return (
    <>
      {/* Sticky Bottom Drawer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-lg w-full px-4 animate-in slide-in-from-bottom duration-300">
        <div className="glass-panel border border-indigo-500/30 bg-slate-900/90 text-white rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-extrabold text-sm shrink-0">
              {compareIds.length}
            </div>
            <div>
              <p className="text-xs font-bold">Compare Accommodations</p>
              <p className="text-[10px] text-indigo-300 font-medium">
                {compareIds.length} of 3 selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              disabled={compareIds.length < 2}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
                compareIds.length >= 2
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Compare Now
            </button>
            <button
              onClick={clearCompare}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Clear Comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Compare Matrix Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500" /> Accommodation Comparison Matrix
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-3 gap-4 py-12">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : pgList.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Failed to fetch comparison details.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 bg-slate-50 dark:bg-slate-950 rounded-tl-xl text-slate-400 font-bold uppercase tracking-wider w-40">Features</th>
                      {pgList.map((pg) => (
                        <th key={pg._id || pg.id} className="p-3 bg-slate-50 dark:bg-slate-950 border-l border-slate-100 dark:border-slate-800 text-center min-w-[200px]">
                          <div className="relative space-y-2">
                            <button
                              onClick={() => removeFromCompare(pg._id || pg.id)}
                              className="absolute top-0 right-0 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <img
                              src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'}
                              alt="Thumbnail"
                              className="w-24 h-16 object-cover rounded-lg mx-auto shadow-sm"
                            />
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {pg.title}
                            </div>
                            <button
                              onClick={() => {
                                setShowModal(false);
                                setSelectedPGId(pg._id || pg.id);
                                setCurrentTab('pg-detail');
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline"
                            >
                              View Details
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">Monthly Rent</td>
                      {pgList.map((pg) => (
                        <td key={pg._id || pg.id} className="p-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                          ₹{pg.pricePerMonth?.toLocaleString()}/mo
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">Security Deposit</td>
                      {pgList.map((pg) => (
                        <td key={pg._id || pg.id} className="p-3 text-center font-semibold text-slate-900 dark:text-white">
                          ₹{pg.deposit?.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">Room Type</td>
                      {pgList.map((pg) => (
                        <td key={pg._id || pg.id} className="p-3 text-center text-slate-600 dark:text-slate-400">
                          {pg.roomType}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">Gender Preference</td>
                      {pgList.map((pg) => (
                        <td key={pg._id || pg.id} className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pg.gender === 'Girls Only'
                              ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400'
                              : pg.gender === 'Boys Only'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          }`}>
                            {pg.gender}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">Rating ★</td>
                      {pgList.map((pg) => (
                        <td key={pg._id || pg.id} className="p-3 text-center font-bold text-amber-500">
                          ★ {pg.rating || '5.0'} ({pg.reviewsCount || 0})
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">Location</td>
                      {pgList.map((pg) => (
                        <td key={pg._id || pg.id} className="p-3 text-center text-slate-600 dark:text-slate-400 line-clamp-1 max-w-[200px] mx-auto">
                          {pg.location}
                        </td>
                      ))}
                    </tr>

                    {/* Amenities Headers */}
                    <tr className="bg-slate-50/50 dark:bg-slate-950/50">
                      <td colSpan={pgList.length + 1} className="p-2.5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">Amenities Checklist</td>
                    </tr>

                    {allAmenities.map((amenity) => (
                      <tr key={amenity}>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{amenity}</td>
                        {pgList.map((pg) => {
                          const hasAmenity = pg.amenities?.includes(amenity);
                          return (
                            <td key={pg._id || pg.id} className="p-3 text-center">
                              {hasAmenity ? (
                                <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                              ) : (
                                <Minus className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
