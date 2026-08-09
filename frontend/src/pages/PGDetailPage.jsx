import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { useCollege } from '../context/CollegeContext';
import { AIInsightsCard } from '../components/AIInsightsCard';
import {
  Star, MapPin, CheckCircle2, Phone, MessageSquare, ShieldCheck,
  Wifi, Utensils, Zap, Users, Send, AlertCircle, Heart, X, Play,
  ChevronLeft, ChevronRight, Compass, ShieldAlert, Award, FileText, Calendar
} from 'lucide-react';

export const PGDetailPage = ({ pgId, setCurrentTab }) => {
  const { user, toggleSavePG } = useAuth();
  const { addToCompare, removeFromCompare, isComparing } = useCompare();
  const { selectedCollege } = useCollege();
  
  const [pg, setPg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Gallery states
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  // Review form states
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [cleanliness, setCleanliness] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [safetyRating, setSafetyRating] = useState(5);
  const [wifiRating, setWifiRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Complaint modal states
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintType, setComplaintType] = useState('Maintenance');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Booking/Visit states
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitBooked, setVisitBooked] = useState(false);

  const fetchPGDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pgs/${pgId}`);
      const data = await res.json();
      if (data.success) {
        setPg(data.data);
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Fetch PG detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pgId) {
      fetchPGDetails();
    }
  }, [pgId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Gathering Verified Accommodations...</p>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">PG Listing Not Found</h2>
        <button
          onClick={() => setCurrentTab('search')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const isSaved = user?.savedPGs?.includes(pg._id || pg.id);
  const comparing = isComparing(pg._id || pg.id);

  const images = pg.images && pg.images.length > 0 ? pg.images : [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
  ];

  const videoUrl = pg.videos && pg.videos.length > 0 ? pg.videos[0] : null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError('Please login to write a review.');
      return;
    }
    if (!newComment.trim()) {
      setReviewError('Please enter review comment.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');

    const payload = {
      rating: newRating,
      title: newTitle,
      comment: newComment,
      categories: {
        cleanliness,
        food: foodRating,
        safety: safetyRating,
        wifi: wifiRating,
        value: valueRating
      }
    };

    try {
      const res = await fetch(`/api/pgs/${pg._id || pg.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('staysmart_token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setNewComment('');
        setNewTitle('');
        setNewRating(5);
      } else {
        setReviewError(data.message || 'Error submitting review.');
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const fallbackRev = {
        _id: `rev_${Date.now()}`,
        userName: user.name,
        userRole: user.role === 'student' ? 'Verified Student' : 'Verified User',
        rating: newRating,
        title: newTitle,
        comment: newComment,
        categories: payload.categories,
        verified: user.role === 'student',
        createdAt: new Date()
      };
      setReviews([fallbackRev, ...reviews]);
      setNewComment('');
      setNewTitle('');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintDesc.trim()) return;

    setComplaintSubmitting(true);
    try {
      const res = await fetch(`/api/pgs/${pg._id || pg.id}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('staysmart_token')}`
        },
        body: JSON.stringify({ type: complaintType, description: complaintDesc })
      });
      const data = await res.json();
      if (data.success) {
        setComplaintSuccess(true);
        setComplaintDesc('');
      }
    } catch (err) {
      console.error(err);
      // fallback mock success
      setComplaintSuccess(true);
      setComplaintDesc('');
    } finally {
      setComplaintSubmitting(false);
    }
  };

  const handleBookVisit = (e) => {
    e.preventDefault();
    if (!visitDate || !visitTime) return;
    setVisitBooked(true);
  };

  const toggleCompare = () => {
    if (comparing) {
      removeFromCompare(pg._id || pg.id);
    } else {
      addToCompare(pg._id || pg.id);
    }
  };

  const collegeColor = selectedCollege?.color || '#4f46e5';

  return (
    <div className="space-y-6 pb-24">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCurrentTab('home')} className="hover:text-indigo-600 transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => setCurrentTab('search')} className="hover:text-indigo-600 transition-colors">Search</button>
          <span>/</span>
          <span className="text-slate-900 dark:text-white line-clamp-1">{pg.title}</span>
        </div>
        <button
          onClick={() => setCurrentTab('search')}
          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          ← Back to Browse
        </button>
      </div>

      {/* Main Grid: Info Section + Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details, Media, Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Block */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                {pg.gender} PG
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
                {pg.roomType} room setup
              </span>
              {pg.isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Listing
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {pg.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{pg.location}, {pg.city || 'Delhi'}</span>
            </div>
          </div>

          {/* Media Showcase (Gallery & Video) */}
          <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-950 group">
              {showVideo && videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={images[activeImage]}
                  alt="PG Showcase"
                  onClick={() => setLightboxOpen(true)}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                />
              )}
              {videoUrl && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="absolute bottom-4 left-4 bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <Play className="w-4 h-4" /> {showVideo ? 'Show Photos' : 'Play Video tour'}
                </button>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {!showVideo && images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === idx ? 'border-indigo-500 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            {['overview', 'reviews', 'location', 'rules'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 font-bold text-xs capitalize tracking-wide transition-all border-b-2 -mb-[2px] ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* AI Insights Card */}
                <AIInsightsCard
                  pg={pg}
                  reviews={reviews}
                  onTranslateReview={(reviewId, newText) => {
                    setReviews(prev =>
                      prev.map(r => ((r._id === reviewId || r.id === reviewId) ? { ...r, comment: newText } : r))
                    );
                  }}
                />

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">About Property</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
                    {pg.description}
                  </p>
                </div>

                {/* Amenities checklist with icons */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Verified Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {pg.amenities?.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Sharing Setup</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{pg.sharingCapacity || '2 Sharing'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Floor Plan</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{pg.floorPlan ? 'Plan Uploaded' : 'Standard 1BHK/2BHK'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Form to submit review */}
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-900">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-500" /> Share Your Student Review
                  </h3>
                  
                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Overall Slider */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500 font-semibold">Overall Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setNewRating(s)}
                              className="hover:scale-110 transition-transform"
                            >
                              <Star className={`w-5 h-5 ${s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sub Category Ratings */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                        {[
                          { val: cleanliness, set: setCleanliness, lbl: 'Cleanliness' },
                          { val: foodRating, set: setFoodRating, lbl: 'Food Quality' },
                          { val: safetyRating, set: setSafetyRating, lbl: 'Safety' },
                          { val: wifiRating, set: setWifiRating, lbl: 'Wi-Fi' },
                          { val: valueRating, set: setValueRating, lbl: 'Value' }
                        ].map(({ val, set, lbl }) => (
                          <div key={lbl} className="space-y-1">
                            <span className="text-[10px] text-slate-400 block font-bold">{lbl}</span>
                            <select
                              value={val}
                              onChange={(e) => set(Number(e.target.value))}
                              className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
                            >
                              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                            </select>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Review Title</label>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Spacious rooms and amazing location!"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Detailed Feedback</label>
                        <textarea
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write about wifi stability, curfew relaxation, study desks..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>

                      {reviewError && (
                        <div className="text-xs text-red-500 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {reviewError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
                        style={{ background: collegeColor }}
                      >
                        Submit Student Review
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-500">
                      🔒 Verified Students can write reviews. Switch role to verified student.
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No student feedback posted yet.</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev._id || rev.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{rev.userName}</span>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                  Verified Student
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{rev.userRole}</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" /> {rev.rating} / 5
                          </div>
                        </div>

                        <div>
                          {rev.title && <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{rev.title}</h4>}
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">"{rev.comment}"</p>
                        </div>

                        {rev.categories && (
                          <div className="grid grid-cols-5 gap-1 text-center bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                            {Object.entries(rev.categories).map(([c, v]) => (
                              <div key={c}>
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{v}/5</div>
                                <div className="text-[9px] text-slate-400 capitalize">{c}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Google Maps iframe simulator */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Property Map Location</h3>
                  <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    {/* Simulated Interactive OpenStreetMap Iframe */}
                    <iframe
                      title="OSM Map View"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${pg.mapCoordinates?.lng - 0.015}%2C${pg.mapCoordinates?.lat - 0.015}%2C${pg.mapCoordinates?.lng + 0.015}%2C${pg.mapCoordinates?.lat + 0.015}&layer=mapnik&marker=${pg.mapCoordinates?.lat}%2C${pg.mapCoordinates?.lng}`}
                      className="absolute inset-0 grayscale dark:invert dark:opacity-85"
                    />
                    <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold shadow-lg border border-white/10 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{pg.location}</span>
                    </div>
                  </div>
                </div>

                {/* Nearby Places Cards */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nearby Places &amp; Distance</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pg.nearbyPlaces && pg.nearbyPlaces.length > 0 ? (
                      pg.nearbyPlaces.map((place, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{place.name}</div>
                            <div className="text-[10px] text-slate-400">{place.type} zone</div>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{place.distance}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">Local Metro Station</div>
                            <div className="text-[10px] text-slate-400">Transit</div>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">450m</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">Main University Gate</div>
                            <div className="text-[10px] text-slate-400">Education</div>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">600m</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">House Regulations</h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl list-disc pl-5">
                  {pg.rules && pg.rules.length > 0 ? (
                    pg.rules.map((rule, idx) => <li key={idx}>{rule}</li>)
                  ) : (
                    <>
                      <li>Loud music or parties are not permitted inside PG rooms</li>
                      <li>Overnight guests require tenant details and prior approval</li>
                      <li>Curfew curfew timing strictly set to 10:30 PM</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Quick Booking Actions */}
        <div className="space-y-6">
          {/* Main Price Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Monthly rent starts from</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    ₹{pg.pricePerMonth?.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/month</span>
                </div>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => user ? toggleSavePG(pg._id || pg.id) : alert('Please log in to save properties')}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isSaved ? 'bg-red-500 text-white border-red-500 shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Security Deposit:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">₹{pg.deposit?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Beds:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{pg.occupancyStatus || 'Beds Available'}</span>
              </div>
              <div className="flex justify-between">
                <span>Rating:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">★ {pg.rating || '5.0'}</span>
              </div>
            </div>

            {/* Compare Checkbox */}
            <button
              onClick={toggleCompare}
              className={`w-full py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                comparing
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {comparing ? '✓ Added to Comparison' : 'Add to Compare'}
            </button>

            {/* Inquiry/Owner Contacts */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`tel:${pg.ownerPhone || '9876543210'}`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" /> Call Owner ({pg.ownerName})
              </a>
              <a
                href={`https://wa.me/${(pg.ownerPhone || '9876543210').replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20your%20PG%20${encodeURIComponent(pg.title)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Message
              </a>
            </div>
          </div>

          {/* Schedule Visit Form */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Book Physical/Virtual Visit
            </h3>

            {visitBooked ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-center space-y-1 font-semibold">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p>Visit Scheduled Successfully!</p>
                <p className="text-[10px] text-slate-400">Landlord will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBookVisit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Preferred Time</label>
                  <input
                    type="time"
                    required
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold shadow-sm"
                >
                  Schedule Free Visit
                </button>
              </form>
            )}
          </div>

          {/* Raise Complaint Action Button */}
          <button
            onClick={() => setComplaintOpen(true)}
            className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/20 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" /> Report Issue / file Complaint
          </button>
        </div>
      </div>

      {/* Complaint Filing Modal Modal */}
      {complaintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" /> Report Issue to Admin
              </h2>
              <button
                onClick={() => { setComplaintOpen(false); setComplaintSuccess(false); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {complaintSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-900 dark:text-white">Complaint Lodged</h3>
                <p className="text-xs text-slate-500">
                  Your complaint was filed successfully. StaySmart administrators will review the issue and contact the property owner.
                </p>
                <button
                  onClick={() => { setComplaintOpen(false); setComplaintSuccess(false); }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category of Issue</label>
                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Maintenance">Maintenance (Plumbing, AC, WiFi)</option>
                    <option value="Safety">Safety &amp; Curfew Security</option>
                    <option value="Cleanliness">Cleanliness &amp; Hygiene</option>
                    <option value="Food">Food Catering</option>
                    <option value="Roommate Issue">Roommate Conflicts</option>
                    <option value="Other">Other / Deposit Issues</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Explain the issue</label>
                  <textarea
                    rows={4}
                    required
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    placeholder="Provide details (e.g. WiFi down for 3 days, water cut in mornings...)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={complaintSubmitting}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  File Official Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Gallery Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 text-white">
          <div className="flex justify-between items-center text-xs">
            <span>Image {activeImage + 1} of {images.length}</span>
            <button onClick={() => setLightboxOpen(false)} className="p-2 bg-slate-800/80 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative flex-1 flex items-center justify-center">
            <button
              onClick={() => setActiveImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-4 p-2 bg-slate-800/80 rounded-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <img src={images[activeImage]} alt="Showcase large" className="max-h-[80vh] max-w-full object-contain" />
            <button
              onClick={() => setActiveImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
              className="absolute right-4 p-2 bg-slate-800/80 rounded-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 ${activeImage === idx ? 'border-indigo-500' : 'border-transparent opacity-55'}`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
