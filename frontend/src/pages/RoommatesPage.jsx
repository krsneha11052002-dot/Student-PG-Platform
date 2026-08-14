import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useCollege } from '../context/CollegeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  Users, Sparkles, Search, BookOpen, Coffee, Moon, Sun,
  Music, Dumbbell, Utensils, MessageCircle, Heart, X, 
  GraduationCap, MapPin, CheckCircle, UserPlus, Loader2,
  Pencil, Trash2, RefreshCw
} from 'lucide-react';

const LIFESTYLE_OPTIONS = [
  { label: 'Night Owl', icon: Moon },
  { label: 'Early Bird', icon: Sun },
  { label: 'Quiet Study', icon: BookOpen },
  { label: 'Gamer', icon: Coffee },
  { label: 'Gym Freak', icon: Dumbbell },
  { label: 'Vegetarian', icon: Utensils },
  { label: 'Music Lover', icon: Music },
  { label: 'Bookworm', icon: BookOpen },
  { label: 'Non-Smoker', icon: CheckCircle },
];

// Single example/demo post shown only when no real posts exist (or always as the last card)
const EXAMPLE_POST = {
  _id: 'example_r1',
  id: 'example_r1',
  isExample: true,
  userName: 'Aarav Sharma (Example)',
  gender: 'Male',
  year: '2nd Year',
  department: 'Computer Science',
  college: 'Campus',
  area: 'University Area',
  matchScore: 96,
  avatar: '👨‍💻',
  lifestyle: ['Night Owl', 'Quiet Study', 'Non-Smoker'],
  lookingFor: 'Single Room / 2-Sharing',
  budget: '₹8,000–₹12,000/mo',
  bio: 'This is an example post to show you what a real roommate profile looks like. Register and post your own!',
  verified: true,
  createdAt: new Date().toISOString(),
};

export const RoommatesPage = ({ setCurrentTab }) => {
  const { selectedCollege } = useCollege();
  const { user, token } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [likedIds, setLikedIds] = useState([]);
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [submittingRequest, setSubmittingRequest] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editPost, setEditPost] = useState(null);

  // Form states
  const [lookingFor, setLookingFor] = useState('2-Sharing Room');
  const [budget, setBudget] = useState('');
  const [bio, setBio] = useState('');
  const [selectedFormTraits, setSelectedFormTraits] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const collegeColor = selectedCollege?.color || '#4f46e5';

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roommates');
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Fetch roommate posts error:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch already-sent requests for current user
  const fetchMyRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/roommates/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const sentIds = new Set([
          ...data.sent.filter(r => r.status === 'pending').map(r => String(r.postId))
        ]);
        setRequestedIds(sentIds);
      }
    } catch (e) {}
  }, [token]);

  useEffect(() => {
    fetchPosts();
    fetchMyRequests();
  }, [fetchPosts, fetchMyRequests]);

  // Merge real posts with the single example post at the end
  const allPosts = useMemo(() => {
    return [...posts, EXAMPLE_POST];
  }, [posts]);

  const filtered = useMemo(() => {
    return allPosts.filter(rm => {
      const name = rm.userName || rm.name || '';
      const dept = rm.department || '';
      const lifestyle = rm.lifestyle || [];
      const matchesSearch = !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lifestyle.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGender = genderFilter === 'All' || rm.gender === genderFilter;
      const matchesTraits = selectedTraits.length === 0 ||
        selectedTraits.every(t => lifestyle.includes(t));
      return matchesSearch && matchesGender && matchesTraits;
    });
  }, [allPosts, searchQuery, genderFilter, selectedTraits]);

  const toggleTrait = (trait) => {
    setSelectedTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const handleSendRequest = async (rm) => {
    if (!user) {
      showError('Please log in to send a roommate request.');
      setCurrentTab('login');
      return;
    }
    if (rm.isExample) {
      showInfo('This is an example post. You cannot send requests to example posts.');
      return;
    }
    const postId = rm._id;
    const myId = String(user.id || user._id);
    const ownerId = String(rm.userId);
    if (ownerId === myId) {
      showError('You cannot send a request to your own post.');
      return;
    }
    if (requestedIds.has(String(postId))) {
      showInfo('You already sent a request to this post.');
      return;
    }
    setSubmittingRequest(postId);
    try {
      const res = await fetch(`/api/roommates/${postId}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequestedIds(prev => new Set([...prev, String(postId)]));
        showSuccess('Roommate request sent! 🎉 They will be notified.');
      } else {
        showError(data.message || 'Failed to send request');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setSubmittingRequest(null);
    }
  };

  const handleDelete = async (rm) => {
    if (!window.confirm(`Delete your roommate post? This cannot be undone.`)) return;
    setDeletingId(rm._id);
    try {
      const res = await fetch(`/api/roommates/${rm._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Post deleted.');
        fetchPosts();
      } else {
        showError(data.message || 'Failed to delete post');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditForm = (rm) => {
    setEditPost(rm);
    setLookingFor(rm.lookingFor || '2-Sharing Room');
    setBudget(rm.budget || '');
    setBio(rm.bio || '');
    setSelectedFormTraits(rm.lifestyle || []);
    setShowPostForm(true);
  };

  const handleSubmitPost = async () => {
    if (!bio.trim() && !budget.trim()) {
      showError('Please fill in at least Bio or Budget.');
      return;
    }
    setSubmitting(true);
    const payload = {
      lookingFor,
      budget: budget || '₹8,000–₹12,000/mo',
      bio: bio || 'Looking for a clean and friendly roommate.',
      lifestyle: selectedFormTraits.length > 0 ? selectedFormTraits : ['Non-Smoker'],
      college: selectedCollege?.shortName || '',
      area: selectedCollege?.area || '',
    };

    try {
      const url = editPost ? `/api/roommates/${editPost._id}` : '/api/roommates';
      const method = editPost ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(editPost ? 'Post updated! ✅' : 'Your roommate profile has been posted! 🎉');
        setShowPostForm(false);
        setEditPost(null);
        setBio(''); setBudget(''); setSelectedFormTraits([]);
        fetchPosts();
      } else {
        showError(data.message || 'Failed to save post');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Fix: send payload in POST/PUT
  const handleSubmitPostFixed = async () => {
    if (!bio.trim() && !budget.trim()) {
      showError('Please fill in at least Bio or Budget.');
      return;
    }
    setSubmitting(true);
    const payload = {
      lookingFor,
      budget: budget || '₹8,000–₹12,000/mo',
      bio: bio || 'Looking for a clean and friendly roommate.',
      lifestyle: selectedFormTraits.length > 0 ? selectedFormTraits : ['Non-Smoker'],
      college: selectedCollege?.shortName || '',
      area: selectedCollege?.area || '',
    };

    try {
      const url = editPost ? `/api/roommates/${editPost._id}` : '/api/roommates';
      const method = editPost ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(editPost ? 'Post updated! ✅' : 'Your roommate profile has been posted! 🎉');
        setShowPostForm(false);
        setEditPost(null);
        setBio(''); setBudget(''); setSelectedFormTraits([]);
        fetchPosts();
      } else {
        showError(data.message || 'Failed to save post');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const myId = user ? String(user.id || user._id) : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div
        className="p-8 rounded-3xl text-white shadow-xl relative overflow-hidden"
        style={{ background: selectedCollege ? `linear-gradient(135deg, ${selectedCollege.color}dd, ${selectedCollege.color}77)` : 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="text-2xl">{selectedCollege?.emoji || '👥'}</span>
              {selectedCollege?.shortName} Roommates
            </div>
            <h1 className="text-3xl font-extrabold">Find Your Perfect Roommate 🤝</h1>
            <p className="text-sm text-white/80 mt-1 max-w-md">
              Connect with fellow <strong>{selectedCollege?.shortName || 'campus'}</strong> students looking for roommates near campus.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setEditPost(null); setBio(''); setBudget(''); setSelectedFormTraits([]); setShowPostForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm border border-white/30 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Post My Profile
            </button>
            <button
              onClick={fetchPosts}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 font-semibold text-xs border border-white/20 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search roommates near ${selectedCollege?.shortName || 'campus'}...`}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>
        {['All', 'Male', 'Female'].map(g => (
          <button
            key={g}
            onClick={() => setGenderFilter(g)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              genderFilter === g
                ? 'text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            style={genderFilter === g ? { background: collegeColor } : {}}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Lifestyle Tags */}
      <div className="flex flex-wrap gap-2">
        {LIFESTYLE_OPTIONS.map(({ label }) => (
          <button
            key={label}
            onClick={() => toggleTrait(label)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              selectedTraits.includes(label)
                ? 'text-white border-transparent'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            style={selectedTraits.includes(label) ? { background: collegeColor } : {}}
          >
            {label}
          </button>
        ))}
        {selectedTraits.length > 0 && (
          <button
            onClick={() => setSelectedTraits([])}
            className="px-3 py-1 rounded-full text-xs font-semibold border border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-950/30"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="font-semibold">{posts.length} real profile{posts.length !== 1 ? 's' : ''} posted</span>
        <span>·</span>
        <span className="text-amber-600 font-semibold">1 example post shown</span>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No roommate profiles match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rm) => {
            const liked = likedIds.includes(rm._id || rm.id);
            const postId = String(rm._id || rm.id);
            const ownerId = String(rm.userId || '');
            const isOwner = myId && ownerId === myId;
            const alreadyRequested = requestedIds.has(postId);
            const isSending = submittingRequest === (rm._id || rm.id);
            const isDeleting = deletingId === rm._id;

            return (
              <div
                key={rm._id || rm.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 hover:shadow-lg hover:border-indigo-400/50 transition-all group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-slate-100 dark:bg-slate-800 shrink-0">
                      {rm.avatar || '🎓'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{rm.userName || rm.name}</h3>
                        {rm.verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                        )}
                        {rm.isExample && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                            EXAMPLE POST
                          </span>
                        )}
                        {isOwner && !rm.isExample && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            Your Post
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{rm.year} · {rm.department}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] text-indigo-500 font-medium">{rm.area || selectedCollege?.area || 'Campus'}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Match Score Badge */}
                  <div className="text-center shrink-0">
                    <div
                      className="text-lg font-extrabold"
                      style={{ color: rm.matchScore >= 90 ? '#10b981' : rm.matchScore >= 80 ? '#f59e0b' : '#6366f1' }}
                    >
                      {rm.matchScore}%
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase leading-none">AI Match</div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{rm.bio}</p>

                {/* Lifestyle Tags */}
                <div className="flex flex-wrap gap-1">
                  {(rm.lifestyle || []).map(trait => (
                    <span key={trait}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Info Row */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{rm.budget}</span>
                  <span>{rm.lookingFor}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {isOwner && !rm.isExample ? (
                    <>
                      <button
                        onClick={() => openEditForm(rm)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rm)}
                        disabled={isDeleting}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSendRequest(rm)}
                        disabled={isSending || alreadyRequested || rm.isExample}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:cursor-not-allowed ${
                          alreadyRequested
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                            : rm.isExample
                            ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed'
                            : 'text-white shadow-sm hover:opacity-90'
                        }`}
                        style={!alreadyRequested && !rm.isExample ? { background: collegeColor } : {}}
                      >
                        {isSending
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                          : alreadyRequested
                          ? <><CheckCircle className="w-3.5 h-3.5" /> Request Sent!</>
                          : rm.isExample
                          ? 'Example Only'
                          : <><MessageCircle className="w-3.5 h-3.5" /> Send Request</>
                        }
                      </button>
                      <button
                        onClick={() => setLikedIds(prev => prev.includes(rm._id || rm.id) ? prev.filter(i => i !== (rm._id || rm.id)) : [...prev, rm._id || rm.id])}
                        className={`p-2 rounded-xl border transition-all ${
                          liked
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-700 text-red-500'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-red-300 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                      </button>
                    </>
                  )}
                </div>

                {/* Posted Time */}
                <p className="text-[10px] text-slate-400 text-right">
                  {rm.isExample ? 'Example post' : rm.createdAt ? new Date(rm.createdAt).toLocaleDateString() : 'Just now'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Post / Edit Profile Modal */}
      {showPostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                {editPost ? 'Edit Roommate Profile' : 'Post Your Roommate Profile'}
              </h2>
              <button onClick={() => { setShowPostForm(false); setEditPost(null); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {user ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">What are you looking for?</label>
                  <select
                    value={lookingFor}
                    onChange={e => setLookingFor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>Single Room</option>
                    <option>2-Sharing Room</option>
                    <option>3-Sharing Room</option>
                    <option>Studio</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Budget Range</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="e.g. ₹7,000 – ₹12,000/mo"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Lifestyle Traits</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-slate-200 dark:border-slate-700 rounded-xl">
                    {LIFESTYLE_OPTIONS.map(({ label }) => {
                      const isSelected = selectedFormTraits.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setSelectedFormTraits(prev => isSelected ? prev.filter(t => t !== label) : [...prev, label])}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Brief Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder={`Tell potential roommates about yourself near ${selectedCollege?.area || 'campus'}...`}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <button
                  onClick={handleSubmitPostFixed}
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: collegeColor }}
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editPost ? '✅ Update Post' : '🚀 Post My Profile'}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3 py-4">
                <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Please log in to post a roommate profile.</p>
                <button onClick={() => { setShowPostForm(false); setCurrentTab('login'); }}
                  className="px-6 py-2 rounded-xl text-white text-xs font-bold" style={{ background: collegeColor }}>
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
