import React, { useState, useEffect, useMemo } from 'react';
import { useCollege } from '../context/CollegeContext';
import { useAuth } from '../context/AuthContext';
import { CreatePostModal } from '../components/CreatePostModal';
import { AICommunityCard } from '../components/AICommunityCard';
import {
  Users, MessageSquare, ThumbsUp, Plus, Search, Tag, Heart,
  GraduationCap, RefreshCw, AlertTriangle, ShoppingBag, HelpCircle,
  Wrench, Calendar, PhoneCall, Shield, CheckCircle, Image as ImageIcon,
  MapPin, Clock, ExternalLink, Send, Sparkles, MessageCircle, ChevronRight,
  Flame, BookOpen, AlertCircle, Trash2, Pencil, Loader2
} from 'lucide-react';

export const CommunityPage = ({ setCurrentTab }) => {
  const { selectedCollege, changeCollege } = useCollege();
  const { user, token } = useAuth();

  const collegeName = selectedCollege?.name || 'Delhi University Campus';
  const collegeShort = selectedCollege?.shortName || 'Campus';
  const collegeColor = selectedCollege?.color || '#4f46e5';

  const [activeTab, setActiveTab] = useState('feed'); // feed, forum, roommates, marketplace, lost_found, services, events, emergency
  const [forumSubCat, setForumSubCat] = useState('all');
  
  const [posts, setPosts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [openCommentsId, setOpenCommentsId] = useState(null);

  // SOS Emergency Modal state
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosLocation, setSosLocation] = useState('');
  const [sosIssue, setSosIssue] = useState('Security / Theft Alert');
  const [sosPhone, setSosPhone] = useState('');
  const [sosSentAlert, setSosSentAlert] = useState(null);

  // Fetch Community Posts & Services
  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const postsRes = await fetch(`/api/community/posts?collegeShortName=${encodeURIComponent(collegeShort)}`);
      const postsData = await postsRes.json();
      if (postsData.success) {
        setPosts(postsData.posts);
      }

      const servRes = await fetch(`/api/community/services?collegeShortName=${encodeURIComponent(collegeShort)}`);
      const servData = await servRes.json();
      if (servData.success) {
        setServices(servData.services);
      }
    } catch (err) {
      console.error('Community fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [collegeShort]);

  // Handle Like Toggle
  const handleLike = async (postId) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?._id || user?.id || 'guest_user' })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId || p._id === postId) {
            return { ...p, likesCount: data.likesCount, liked: data.liked };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setIsDeleting(postId);
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Delete post error:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: user?.name || 'Student Member',
          text
        })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId || p._id === postId) {
            return { ...p, comments: data.comments };
          }
          return p;
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Emergency SOS Trigger
  const handleTriggerSOS = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/community/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeShortName: collegeShort,
          location: sosLocation || collegeShort,
          issueType: sosIssue,
          contactPhone: sosPhone || '+91 98765 00000',
          details: `Immediate SOS requested by ${user?.name || 'Student'}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setSosSentAlert(data);
        fetchCommunityData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered posts based on active tab
  const filteredPosts = useMemo(() => {
    let list = posts;

    if (activeTab === 'feed') {
      list = list.filter(p => !p.category || p.category === 'feed' || p.category === 'general');
    } else if (activeTab === 'forum') {
      list = list.filter(p => p.category === 'forum');
      if (forumSubCat !== 'all') {
        list = list.filter(p => p.subCategory === forumSubCat);
      }
    } else if (activeTab === 'marketplace') {
      list = list.filter(p => p.category === 'marketplace');
    } else if (activeTab === 'lost_found') {
      list = list.filter(p => p.category === 'lost_found');
    } else if (activeTab === 'events') {
      list = list.filter(p => p.category === 'event');
    } else if (activeTab === 'emergency') {
      list = list.filter(p => p.category === 'emergency');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.authorName?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [posts, activeTab, forumSubCat, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">

      {/* Hero Banner Header */}
      <div 
        className="rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${collegeColor} 0%, #1e1b4b 100%)`
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Campus Network</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {selectedCollege ? `${collegeName} Community` : 'Delhi Student Community'} 🏛️
            </h1>
            
            <p className="text-sm text-indigo-100 leading-relaxed">
              Connect with verified {collegeShort} students, explore class discussions, trade secondhand items, locate lost belongings, access tiffin/laundry services, and trigger emergency SOS assistance.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => { setEditingPost(null); setShowCreateModal(true); }}
                className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-indigo-600" /> Create Campus Post
              </button>
              
              <button
                onClick={() => { setActiveTab('emergency'); setShowSOSModal(true); }}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/90 text-white font-extrabold text-xs border border-rose-400/30 hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300 animate-pulse" /> Emergency SOS Desk
              </button>

              <button
                onClick={changeCollege}
                className="px-4 py-2.5 rounded-2xl bg-white/15 text-white font-bold text-xs border border-white/20 hover:bg-white/25 transition-all flex items-center gap-1.5 ml-auto sm:ml-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Change Campus Zone
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="grid grid-cols-2 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0">
            <div className="p-3 bg-white/10 rounded-xl">
              <div className="text-2xl font-black">{posts.length + 24}</div>
              <span className="text-[10px] text-indigo-200 font-semibold uppercase">Active Posts</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <div className="text-2xl font-black text-emerald-300">100%</div>
              <span className="text-[10px] text-indigo-200 font-semibold uppercase">Verified Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm flex items-center gap-1 overflow-x-auto">
        {[
          { key: 'feed', label: 'Student Feed', icon: MessageSquare },
          { key: 'forum', label: 'Discussion Forum', icon: HelpCircle },
          { key: 'roommates', label: 'Roommate Board', icon: Users },
          { key: 'marketplace', label: 'Buy & Sell', icon: ShoppingBag },
          { key: 'lost_found', label: 'Lost & Found', icon: Search },
          { key: 'services', label: 'Local Services', icon: Wrench },
          { key: 'events', label: 'Campus Events', icon: Calendar },
          { key: 'emergency', label: 'Emergency Help', icon: AlertTriangle, badge: 'SOS' },
        ].map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => {
              if (key === 'roommates') {
                setCurrentTab ? setCurrentTab('roommates') : setActiveTab(key);
              } else {
                setActiveTab(key);
              }
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* StaySmart AI Community Intelligence Component */}
      <AICommunityCard collegeShortName={collegeShort} />

      {/* Search & Sub-Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab.replace('_', ' ')} inside ${collegeShort}...`}
            className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Sub Category options for Forum */}
        {activeTab === 'forum' && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'Academics', 'PG Advice', 'Careers', 'Campus Life'].map(cat => (
              <button
                key={cat}
                onClick={() => setForumSubCat(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  forumSubCat === cat
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                {cat === 'all' ? 'All Topics' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB CONTENT SECTIONS */}

      {/* 1. STUDENT FEED TAB */}
      {(activeTab === 'feed' || activeTab === 'forum') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Posts Found</h3>
                <p className="text-xs text-slate-400">Be the first student to publish a post for {collegeShort}!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const postId = post.id || post._id;
                const isCommentsOpen = openCommentsId === postId;

                return (
                  <div
                    key={postId}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Author & Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-xl shrink-0">
                          {post.authorAvatar || '🎓'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                            <span>{post.authorName}</span>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle className="w-2.5 h-2.5" /> {post.authorBadge || 'Verified'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-2 mt-0.5">
                            <span>{post.collegeShortName || collegeShort}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2 hours ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user && String(post.authorId) === String(user._id || user.id) && (
                          <div className="flex gap-2 mr-2">
                            <button
                              onClick={() => { setEditingPost(post); setShowCreateModal(true); }}
                              className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                              title="Edit Post"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(postId)}
                              disabled={isDeleting === postId}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-50"
                              title="Delete Post"
                            >
                              {isDeleting === postId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                        {post.subCategory && post.subCategory !== 'General' && (
                          <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900">
                            {post.subCategory}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>

                    {/* Image Attachment */}
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden max-h-80 border border-slate-100 dark:border-slate-800">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((t, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar (Likes & Comments) */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button
                        onClick={() => handleLike(postId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-bold ${
                          post.liked
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-900'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likesCount || 0} Likes</span>
                      </button>

                      <button
                        onClick={() => setOpenCommentsId(isCommentsOpen ? null : postId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 font-bold transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments?.length || 0} Comments</span>
                      </button>
                    </div>

                    {/* Nested Comments Drawer */}
                    {isCommentsOpen && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-2xl">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Student Comments ({post.comments?.length || 0}):
                        </span>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {post.comments?.map((c, idx) => (
                            <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{c.authorName}</span>
                                <span className="text-slate-400">Just now</span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300">{c.text}</p>
                            </div>
                          ))}
                        </div>

                        {/* Comment Input */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={commentInputs[postId] || ''}
                            onChange={e => setCommentInputs({ ...commentInputs, [postId]: e.target.value })}
                            placeholder="Write a response as verified student..."
                            className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleAddComment(postId)}
                            className="p-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

          {/* Right Sidebar Widgets */}
          <div className="space-y-6">
            
            {/* Campus Guidelines */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" /> {collegeShort} Community Rules
              </h3>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Only verified students can comment & trade.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Report scam PG listings immediately to Emergency Desk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Keep buy/sell prices fair and negotiable.</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white space-y-3 shadow-lg">
              <h3 className="font-black text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" /> AI Housing Advisor
              </h3>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Need immediate PG recommendations or roommate verification near {collegeShort}? Ask StaySmart AI assistant!
              </p>
              <button
                onClick={() => setCurrentTab && setCurrentTab('search')}
                className="w-full py-2.5 rounded-xl bg-white text-indigo-600 font-extrabold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
              >
                <span>Find Matched PGs Nearby</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. BUY & SELL MARKETPLACE TAB */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {collegeShort} Buy & Sell Marketplace 🛒
              </h2>
              <p className="text-xs text-slate-400">Trade secondhand textbooks, study tables, mini-fridges, and cycles with fellow students.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Sell an Item
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const m = post.marketplace || { price: 1500, condition: 'Like New', contactWhatsApp: '+91 98765 00000' };
              return (
                <div key={post.id || post._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
                  {post.imageUrl ? (
                    <div className="h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-36 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-4xl">
                      📦
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                      ₹{m.price?.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{m.condition}</span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{post.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.content}</p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">Posted by {post.authorName}</span>
                    <a
                      href={`https://wa.me/${m.contactWhatsApp?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Contact Seller
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LOST & FOUND TAB */}
      {activeTab === 'lost_found' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {collegeShort} Lost & Found Board 🔍
              </h2>
              <p className="text-xs text-slate-400">Report missing campus belongings or help return found items.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Report Lost / Found Item
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const lf = post.lostFound || { status: 'LOST', location: collegeShort, contactPhone: '+91 98765 00000' };
              const isLost = lf.status === 'LOST';
              return (
                <div key={post.id || post._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                      isLost ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40' : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40'
                    }`}>
                      {isLost ? '🔍 LOST ITEM' : '🎉 FOUND ITEM'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-500" /> {lf.location}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{post.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{post.content}</p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[10px]">Contact: {lf.contactPhone}</span>
                    <a
                      href={`tel:${lf.contactPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700"
                    >
                      Call / Claim
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. LOCAL SERVICES DIRECTORY TAB */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {collegeShort} Local Student Services 🛠️
            </h2>
            <p className="text-xs text-slate-400">Verified tiffin services, 24/7 laundry, print shops, and bike rentals near campus.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {services.map((serv) => (
              <div key={serv.id || serv._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-3xl shrink-0">
                  {serv.icon || '🛠️'}
                </div>
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900">
                      {serv.category}
                    </span>
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      ⭐ {serv.rating} ({serv.reviewsCount})
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{serv.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {serv.address}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {serv.features?.map((f, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                        ✓ {f}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{serv.priceRange}</span>
                    <a
                      href={`tel:${serv.contactPhone}`}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call Vendor
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CAMPUS EVENTS TAB */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {collegeShort} Campus Events & Fests 🎉
              </h2>
              <p className="text-xs text-slate-400">Cultural fests, hackathons, sports meets, and study groups.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Host an Event
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredPosts.map((post) => {
              const ev = post.eventDetails || { eventDate: '25th Aug 2026', venue: collegeShort, organizer: 'Student Union', rsvpCount: 120 };
              return (
                <div key={post.id || post._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                  {post.imageUrl && (
                    <div className="h-44 rounded-2xl overflow-hidden">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {ev.eventDate}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {ev.venue}</span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{post.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{post.content}</p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Organized by: {ev.organizer}</span>
                    <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700">
                      RSVP ({ev.rsvpCount + 1} Going)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. EMERGENCY HELP DESK TAB */}
      {activeTab === 'emergency' && (
        <div className="space-y-6">
          <div className="bg-rose-50 dark:bg-rose-950/40 rounded-3xl border border-rose-200 dark:border-rose-900 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl shrink-0 animate-bounce">
                🆘
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                  {collegeShort} Emergency Safety & SOS Desk 🚨
                </h2>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  24/7 Verified Emergency Helplines, Campus Security Desk, and Instant SOS Alert System.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSOSModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 text-white font-black text-sm shadow-xl shadow-rose-600/30 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-amber-300" /> Trigger Instant SOS Alert Broadcast
            </button>
          </div>

          {/* Emergency Hotlines Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'National Emergency', phone: '112', icon: '🚨' },
              { title: 'Women Helpline', phone: '1091', icon: '👩‍🛡️' },
              { title: 'Campus Security Desk', phone: '+91 98765 43210', icon: '👮‍♂️' },
              { title: 'Ambulance Service', phone: '102', icon: '🚑' },
            ].map((h, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 text-center space-y-2 shadow-sm">
                <div className="text-3xl">{h.icon}</div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{h.title}</h3>
                <div className="text-base font-black text-rose-600 dark:text-rose-400">{h.phone}</div>
                <a
                  href={`tel:${h.phone}`}
                  className="inline-block px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-rose-600 hover:text-white transition-colors"
                >
                  Call Hotline Now
                </a>
              </div>
            ))}
          </div>

          {/* Active Emergency Broadcast Posts */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Recent Campus Safety Broadcasts
            </h3>
            {filteredPosts.map((post) => (
              <div key={post.id || post._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs text-rose-600 font-bold">
                  <span>🚨 SOS ALERT</span>
                  <span>2 hours ago</span>
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{post.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE POST MODAL */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingPost(null); }}
        collegeShortName={collegeShort}
        editingPost={editingPost}
        onPostCreated={(newPost) => {
          if (editingPost) {
            setPosts(prev => prev.map(p => (p.id || p._id) === (newPost.id || newPost._id) ? newPost : p));
          } else {
            setPosts(prev => [newPost, ...prev]);
          }
        }}
      />
      {/* SOS EMERGENCY MODAL */}
      {showSOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-200 dark:border-rose-900">
            <div className="flex items-center justify-between text-rose-600">
              <h3 className="font-black text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Send Campus SOS Alert
              </h3>
              <button onClick={() => setShowSOSModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                ✕
              </button>
            </div>

            {sosSentAlert ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 text-center space-y-2">
                <div className="text-3xl">✅</div>
                <h4 className="font-extrabold text-emerald-600">SOS Alert Broadcasted!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Campus security and nearby verified student buddies have been notified of your location.
                </p>
                <button
                  onClick={() => { setShowSOSModal(false); setSosSentAlert(null); }}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  Close Desk
                </button>
              </div>
            ) : (
              <form onSubmit={handleTriggerSOS} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Campus Location / Landmark</label>
                  <input
                    type="text"
                    required
                    value={sosLocation}
                    onChange={e => setSosLocation(e.target.value)}
                    placeholder="e.g. Near Metro Gate 2 / Hostel Canteen"
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Safety Issue Type</label>
                  <select
                    value={sosIssue}
                    onChange={e => setSosIssue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="Security / Theft Alert">Security / Theft Alert</option>
                    <option value="Medical Assistance Required">Medical Assistance Required</option>
                    <option value="Late Night Transport Safety">Late Night Transport Safety</option>
                    <option value="Campus Harassment / Distress">Campus Harassment / Distress</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Your Callback Phone</label>
                  <input
                    type="text"
                    required
                    value={sosPhone}
                    onChange={e => setSosPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSOSModal(false)}
                    className="px-4 py-2 rounded-xl border text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30 hover:bg-rose-700"
                  >
                    Broadcast SOS Alert
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
