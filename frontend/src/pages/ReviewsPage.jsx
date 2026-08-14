import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useCollege } from '../context/CollegeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Star, MapPin, Search, RefreshCw, TrendingUp, Sparkles, PenSquare, CheckCircle, Building2, ThumbsUp, MessageSquare, X, GraduationCap, Loader2, Pencil, Trash2 } from 'lucide-react';

const StarRating = ({ value, size = "sm" }) => {
  const sizes = { sm: "w-3 h-3", md: "w-5 h-5", lg: "w-7 h-7" };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${s} ${star <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-700'}`}
        />
      ))}
    </div>
  );
};

const CategoryBar = ({ label, value }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="w-24 text-slate-500 shrink-0">{label}</span>
    <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
        style={{ width: `${(value / 5) * 100}%` }}
      />
    </div>
    <span className="w-6 font-bold text-slate-700 dark:text-slate-300">{value}/5</span>
  </div>
);

const EXAMPLE_REVIEW = {
  _id: 'example_review1',
  id: 'example_review1',
  isExample: true,
  pgName: 'Example PG',
  reviewer: 'Example Student',
  verified: true,
  year: '3rd Year',
  college: 'Example College',
  rating: 4,
  title: 'Great place, but food can improve',
  body: 'This is an EXAMPLE REVIEW to show you what a real review looks like. Read real reviews or write your own to help other students!',
  date: 'Just now',
  helpful: 12,
  tags: ['Example'],
  categories: { cleanliness: 5, food: 3, safety: 5, wifi: 4, value: 4 },
  avatar: '👩‍🎓'
};

export const ReviewsPage = ({ setCurrentTab }) => {
  const { selectedCollege, changeCollege } = useCollege();
  const { user, token } = useAuth();
  const { showSuccess, showError } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [helpfulIds, setHelpfulIds] = useState([]);
  
  // Write/Edit Form State
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [pgName, setPgName] = useState('');
  const [pgId, setPgId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categories, setCategories] = useState({ cleanliness: 0, food: 0, safety: 0, wifi: 0, value: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pgs/all-reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const allReviews = useMemo(() => [...reviews, EXAMPLE_REVIEW], [reviews]);

  const filtered = useMemo(() => {
    let result = allReviews.filter(r => {
      const matchesSearch = !searchQuery ||
        (r.pgName && r.pgName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.body && r.body.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRating = ratingFilter === 0 || r.rating === ratingFilter;
      return matchesSearch && matchesRating;
    });

    if (sortBy === 'helpful') result = [...result].sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
    else if (sortBy === 'highest') result = [...result].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'lowest') result = [...result].sort((a, b) => a.rating - b.rating);

    return result;
  }, [allReviews, searchQuery, ratingFilter, sortBy]);

  const avgRating = allReviews.length ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1) : "0.0";
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: allReviews.filter(r => r.rating === n).length,
    pct: allReviews.length ? Math.round((allReviews.filter(r => r.rating === n).length / allReviews.length) * 100) : 0
  }));

  const collegeColor = selectedCollege?.color || '#4f46e5';
  const myId = user ? String(user.id || user._id) : null;

  const handleEditOpen = (review) => {
    setEditReview(review);
    setPgName(review.pgName || '');
    setPgId(review.pgId || '');
    setNewReviewRating(review.rating || 0);
    setTitle(review.title || '');
    setBody(review.body || review.comment || '');
    setCategories(review.categories || { cleanliness: 0, food: 0, safety: 0, wifi: 0, value: 0 });
    setShowWriteForm(true);
  };

  const handleDelete = async (review) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    setDeletingId(review._id || review.id);
    try {
      const res = await fetch(`/api/pgs/reviews/${review._id || review.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Review deleted.');
        fetchReviews();
      } else {
        showError(data.message || 'Failed to delete review');
      }
    } catch (e) {
      showError('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!newReviewRating) { showError('Please provide an overall rating'); return; }
    if (!body) { showError('Please write a review comment'); return; }
    setSubmitting(true);

    try {
      if (editReview) {
        // Edit existing review
        const res = await fetch(`/api/pgs/reviews/${editReview._id || editReview.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rating: newReviewRating, title, comment: body, categories })
        });
        const data = await res.json();
        if (data.success) {
          showSuccess('Review updated! ✅');
          setShowWriteForm(false);
          fetchReviews();
        } else {
          showError(data.message || 'Failed to update review');
        }
      } else {
        // Create new review (requires PG selection, simulating with a generic request since PG dropdown isn't fully implemented in this generic view, but we can pass a dummy pgId if none selected)
        const finalPgId = pgId || 'generic_pg_123';
        const res = await fetch(`/api/pgs/${finalPgId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rating: newReviewRating, title, comment: body, categories, isVerified: true })
        });
        const data = await res.json();
        if (data.success) {
          showSuccess('Review submitted! 🌟');
          setShowWriteForm(false);
          fetchReviews();
        } else {
          showError(data.message || 'Failed to submit review');
        }
      }
    } catch (e) {
      showError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div
        className="p-8 rounded-3xl text-white relative overflow-hidden shadow-xl"
        style={{ background: `linear-gradient(135deg, #0f172a, #1e293b, ${collegeColor}99)` }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 translate-x-24 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            {selectedCollege && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold border border-white/20">
                <span>{selectedCollege.emoji}</span> {selectedCollege.name} · PG Reviews
              </div>
            )}
            <h1 className="text-3xl font-extrabold">
              {selectedCollege ? `PG Reviews near ${selectedCollege.shortName}` : 'Verified PG Reviews'} ⭐
            </h1>
            <p className="text-xs text-slate-300 max-w-lg">
              {selectedCollege
                ? `Authentic reviews from verified ${selectedCollege.shortName} students about PGs near ${selectedCollege.area}.`
                : 'Honest, student-verified reviews of PGs and hostels across Delhi-NCR.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => {
                setEditReview(null); setPgName(''); setPgId(''); setTitle(''); setBody('');
                setNewReviewRating(0); setCategories({ cleanliness: 0, food: 0, safety: 0, wifi: 0, value: 0 });
                setShowWriteForm(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-white font-bold text-xs shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
              style={{ color: collegeColor }}
            >
              <PenSquare className="w-4 h-4" /> Write a Review
            </button>
            <button onClick={fetchReviews}
              className="px-4 py-2 rounded-xl bg-white/15 text-white/90 font-semibold text-xs border border-white/20 hover:bg-white/25 transition-colors flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats + Rating Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="text-6xl font-black text-slate-900 dark:text-white">{avgRating}</div>
          <StarRating value={Math.round(parseFloat(avgRating))} size="md" />
          <p className="text-xs text-slate-500 mt-2">{reviews.length} real reviews</p>
          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400" />
            near {selectedCollege?.area || 'Campus'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2.5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Rating Breakdown
          </h3>
          {ratingDist.map(({ star, count, pct }) => (
            <button
              key={star}
              onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
              className={`flex items-center gap-2 w-full rounded-lg px-1 py-0.5 transition-colors ${
                ratingFilter === star ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-4">{star}</span>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 w-8 text-right">{count}</span>
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Category Averages
          </h3>
          {['cleanliness', 'food', 'safety', 'wifi', 'value'].map(cat => {
            const avg = allReviews.length ? (allReviews.reduce((s, r) => s + (r.categories?.[cat] || 0), 0) / allReviews.length).toFixed(1) : "0.0";
            return (
              <CategoryBar key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={parseFloat(avg)} />
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search PG name, review content..."
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 shrink-0">Sort:</span>
          {[
            { val: 'recent', label: 'Latest' },
            { val: 'helpful', label: 'Most Helpful' },
            { val: 'highest', label: '★ Highest' },
            { val: 'lowest', label: '★ Lowest' },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setSortBy(val)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                sortBy === val ? 'text-white border-transparent' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              style={sortBy === val ? { background: collegeColor } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-slate-500">
        Showing <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> review{filtered.length !== 1 ? 's' : ''}
        {selectedCollege && <span className="text-indigo-500 font-semibold"> · {selectedCollege.shortName} Area</span>}
        {ratingFilter > 0 && <span className="text-amber-500 font-semibold"> · {ratingFilter}★ only</span>}
      </p>

      {/* Review Cards */}
      <div className="space-y-5">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Star className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Reviews Found</h3>
            <button onClick={() => { setSearchQuery(''); setRatingFilter(0); }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
              Clear Filters
            </button>
          </div>
        ) : filtered.map((review) => {
          const helpful = helpfulIds.includes(review.id || review._id);
          const isOwner = myId && String(review.userId) === myId;
          const isDeleting = deletingId === (review.id || review._id);

          return (
            <div key={review.id || review._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 hover:shadow-md transition-shadow group">
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                    {review.avatar || '🎓'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{review.reviewer || review.userName}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified Student
                        </span>
                      )}
                      {review.isExample && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                          EXAMPLE REVIEW
                        </span>
                      )}
                      {isOwner && !review.isExample && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shrink-0">
                          Your Review
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{(review.year || '')} {review.college ? `· ${review.college}` : ''}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-indigo-400" />
                      <span className="text-[10px] font-semibold text-indigo-500">{review.pgName || 'General PG'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StarRating value={review.rating} size="sm" />
                  <span className="text-[10px] text-slate-400">{review.date}</span>
                </div>
              </div>

              {/* Review Body */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{review.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{review.body}</p>
              </div>

              {/* Tags */}
              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {review.tags.map(tag => (
                    <span key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Category Breakdown */}
              {review.categories && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {Object.entries(review.categories).map(([cat, val]) => (
                    <div key={cat} className="text-center">
                      <div className="text-sm font-extrabold" style={{ color: val >= 4 ? '#10b981' : val >= 3 ? '#f59e0b' : '#ef4444' }}>
                        {val}/5
                      </div>
                      <div className="text-[9px] text-slate-400 capitalize">{cat}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 mt-2 pt-3">
                <button
                  onClick={() => setHelpfulIds(prev => prev.includes(review.id || review._id) ? prev.filter(i => i !== (review.id || review._id)) : [...prev, review.id || review._id])}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    helpful ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300 hover:text-indigo-500'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${helpful ? 'fill-indigo-500' : ''}`} />
                  Helpful · {(review.helpful || 0) + (helpful ? 1 : 0)}
                </button>
                <div className="flex gap-2">
                  {isOwner && !review.isExample && (
                    <>
                      <button onClick={() => handleEditOpen(review)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(review)} disabled={isDeleting} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition-colors disabled:opacity-50">
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
                      </button>
                    </>
                  )}
                  {!isOwner && (
                    <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> Reply
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Write/Edit Review Modal */}
      {showWriteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PenSquare className="w-5 h-5 text-indigo-500" /> {editReview ? 'Edit Review' : 'Write a PG Review'}
              </h2>
              <button onClick={() => setShowWriteForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {user ? (
              <div className="space-y-4">
                {!editReview && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">PG ID (Temporary for generic reviews)</label>
                    <input type="text" value={pgId} onChange={e => setPgId(e.target.value)} placeholder="Enter a PG ID or leave blank for generic"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Overall Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setNewReviewRating(s)} className="focus:outline-none">
                        <Star className={`w-7 h-7 transition-colors ${s <= (hoverRating || newReviewRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                    {newReviewRating > 0 && <span className="text-sm font-bold text-amber-500 ml-1">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newReviewRating]}</span>}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Review Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarize your experience..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Detailed Review</label>
                  <textarea rows={4} value={body} onChange={e => setBody(e.target.value)} placeholder={`Share your experience...`}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['cleanliness', 'food', 'safety', 'wifi', 'value'].map(cat => (
                    <div key={cat}>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1 capitalize">{cat}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} onClick={() => setCategories(p => ({ ...p, [cat]: s }))}
                            className={`w-4 h-4 cursor-pointer transition-colors ${s <= categories[cat] ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleSubmit} disabled={submitting} className="w-full py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2" style={{ background: collegeColor }}>
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editReview ? '✅ Update Review' : '🌟 Submit Review'}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3 py-4">
                <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Log in as a Verified Student to submit PG reviews.</p>
                <button onClick={() => { setShowWriteForm(false); setCurrentTab('login'); }} className="px-6 py-2 rounded-xl text-white text-xs font-bold" style={{ background: collegeColor }}>
                  Login / Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
