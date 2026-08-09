import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, Star, MapPin, CheckCircle2, Phone, MessageSquare, ShieldCheck, 
  Wifi, Utensils, Zap, Users, Send, AlertCircle, Heart 
} from 'lucide-react';

export const PGDetailModal = ({ pg, onClose }) => {
  const { user, toggleSavePG } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState(pg.reviews || []);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSaved = user?.savedPGs?.includes(pg._id || pg.id);

  const images = (pg.images && pg.images.length > 0) ? pg.images : [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
  ];

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Please log in as a student to post a review.');
      return;
    }
    if (user.role !== 'student' && user.role !== 'admin') {
      setErrorMsg('Only verified students can post reviews on PG accommodations.');
      return;
    }
    if (!newComment.trim()) {
      setErrorMsg('Please write your review comment.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/pgs/${pg._id || pg.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('staysmart_token')}`
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setNewComment('');
        setNewRating(5);
      } else {
        setErrorMsg(data.message || 'Failed to submit review');
      }
    } catch (err) {
      // Local optimistic review fallback
      const mockRev = {
        _id: `rev_${Date.now()}`,
        userName: user.name,
        userRole: 'Verified Student',
        rating: Number(newRating),
        comment: newComment,
        createdAt: new Date()
      };
      setReviews([mockRev, ...reviews]);
      setNewComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {pg.gender} PG
            </span>
            {pg.isVerified && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified by StaySmart
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => user ? toggleSavePG(pg._id || pg.id) : alert('Log in to save')}
              className={`p-2 rounded-full border transition-all ${
                isSaved ? 'bg-red-500 text-white border-red-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Gallery */}
          <div className="space-y-3">
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-950">
              <img 
                src={images[activeImage]} 
                alt="PG Showcase" 
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === idx ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {pg.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{pg.location}, {pg.city || 'Metro Area'}</span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-3 py-1 rounded-lg border border-amber-500/20 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {pg.rating || 4.8} / 5.0
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Based on {reviews.length || pg.reviewsCount || 12} student reviews
                </span>
              </div>
            </div>

            {/* Price Box Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Monthly Rent</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    ₹{pg.pricePerMonth?.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">/month</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">₹{pg.deposit?.toLocaleString() || '10,000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupancy:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{pg.occupancyStatus || 'Available'}</span>
                  </div>
                </div>
              </div>

              {/* Owner Action Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <a
                  href={`tel:${pg.ownerPhone || '+919876543210'}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Owner ({pg.ownerName || 'Landlord'})
                </a>
                <a
                  href={`https://wa.me/${(pg.ownerPhone || '919876543210').replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(pg.title)}%20via%20StaySmart%20AI`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              About Accommodation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {pg.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Verified Amenities & Facilities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pg.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Reviews Section */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Verified Student Reviews ({reviews.length})
              </h3>
            </div>

            {/* Post Review Form */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              {user && (user.role === 'student' || user.role === 'admin') ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Write a Review as <span className="text-emerald-500">{user.name}</span> (Verified Student)
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share food quality, internet speed, security, and landlord responsiveness..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />

                  {errorMsg && (
                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Student Review
                  </button>
                </form>
              ) : (
                <div className="text-center py-3 text-xs text-slate-500 dark:text-slate-400">
                  🔒 <span className="font-semibold text-slate-700 dark:text-slate-300">Verified Students</span> can submit reviews. Switch to Verified Student role to write feedback!
                </div>
              )}
            </div>

            {/* Review Cards List */}
            <div className="space-y-3">
              {reviews.map((rev, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.userName}</span>
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {rev.userRole || 'Verified Student'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating} / 5
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
