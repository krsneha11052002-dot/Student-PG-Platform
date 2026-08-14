import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useCollege } from '../context/CollegeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  ShoppingBag, Plus, Search, Star, Package, BookOpen, Sofa, Laptop,
  Bike, Shirt, MapPin, X, Loader2, Pencil, Trash2, MessageCircle, Clock
} from 'lucide-react';

const CATEGORY_ICONS = {
  books: { icon: BookOpen, label: 'Books & Notes', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  electronics: { icon: Laptop, label: 'Electronics', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  furniture: { icon: Sofa, label: 'Furniture', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  clothing: { icon: Shirt, label: 'Clothing', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  transport: { icon: Bike, label: 'Transport', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  other: { icon: Package, label: 'Other Items', color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

// Single example listing — shown as the last card
const EXAMPLE_LISTING = {
  _id: 'example_item1',
  id: 'example_item1',
  isExample: true,
  category: 'books',
  title: 'Complete Study Notes + PYQs (Example)',
  price: 800,
  condition: 'Good',
  sellerName: 'Example Seller',
  sellerRating: 4.9,
  location: 'Campus Area',
  createdAt: new Date().toISOString(),
  description: 'This is an EXAMPLE PRODUCT to show you what a real listing looks like. Create your own listing by clicking "Sell an Item" above!',
  tags: ['Example'],
  isSold: false,
};

// Build a clean WhatsApp URL from a phone number
const buildWhatsAppUrl = (phone, listingTitle) => {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  const message = encodeURIComponent(`Hi, I'm interested in your listing: "${listingTitle}" on StaySmart AI.`);
  return `https://wa.me/${number}?text=${message}`;
};

export const MarketplacePage = ({ setCurrentTab }) => {
  const { selectedCollege } = useCollege();
  const { user, token } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSell, setShowSell] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [contactingId, setContactingId] = useState(null);
  const [contactedIds, setContactedIds] = useState(new Set());
  const [newItem, setNewItem] = useState({ title: '', price: '', category: 'books', condition: 'Good', description: '' });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace');
      const data = await res.json();
      if (data.success) setListings(data.data || []);
      else setListings([]);
    } catch (err) {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Merge real listings with the single example at the end
  const allListings = useMemo(() => [...listings, EXAMPLE_LISTING], [listings]);

  const displayed = useMemo(() => allListings.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [allListings, selectedCategory, searchQuery]);

  const myId = user ? String(user.id || user._id) : null;

  const handleAddListing = async () => {
    if (!user) { showError('Please log in to list an item.'); setCurrentTab('login'); return; }
    if (!newItem.title || !newItem.price) { showError('Title and price are required.'); return; }
    setSubmitting(true);
    try {
      const url = editListing ? `/api/marketplace/${editListing._id}` : '/api/marketplace';
      const method = editListing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newItem.title,
          price: Number(newItem.price),
          category: newItem.category,
          condition: newItem.condition,
          description: newItem.description,
          location: selectedCollege?.area || 'Campus Area',
          tags: [selectedCollege?.shortName || 'Campus']
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(editListing ? 'Listing updated! ✅' : 'Item listed successfully! 🎉');
        setShowSell(false);
        setEditListing(null);
        setNewItem({ title: '', price: '', category: 'books', condition: 'Good', description: '' });
        fetchListings();
      } else {
        showError(data.message || 'Failed to save listing');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (listing) => {
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    setDeletingId(listing._id);
    try {
      const res = await fetch(`/api/marketplace/${listing._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Listing deleted.');
        setShowDetail(null);
        fetchListings();
      } else {
        showError(data.message || 'Failed to delete listing');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (listing) => {
    setEditListing(listing);
    setNewItem({
      title: listing.title,
      price: String(listing.price),
      category: listing.category,
      condition: listing.condition,
      description: listing.description
    });
    setShowDetail(null);
    setShowSell(true);
  };

  const handleContactSeller = async (listing) => {
    if (!user) { showError('Please log in to contact the seller.'); setCurrentTab('login'); return; }
    if (listing.isExample) { showInfo('This is an example product. You cannot contact an example seller.'); return; }
    const listingId = String(listing._id);
    const ownerId = String(listing.sellerId);
    if (ownerId === myId) { showError('This is your own listing!'); return; }

    setContactingId(listingId);
    try {
      const res = await fetch(`/api/marketplace/${listingId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: `Hi, I'm interested in your listing: "${listing.title}"` })
      });
      const data = await res.json();
      if (data.success || (data.message && data.message.includes('already'))) {
        setContactedIds(prev => new Set([...prev, listingId]));
        showSuccess('Contact request sent to seller! 🚀');
        // Open WhatsApp if seller has a phone number
        const phone = data.sellerPhone;
        if (phone) {
          const waUrl = buildWhatsAppUrl(phone, listing.title);
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        } else {
          showInfo('Seller does not have a phone number listed. They have been notified and will reach out to you.');
        }
      } else {
        showError(data.message || 'Failed to contact seller');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setContactingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div
        className="p-8 rounded-3xl text-white shadow-xl relative overflow-hidden"
        style={{ background: selectedCollege ? `linear-gradient(135deg, ${selectedCollege.color}dd, ${selectedCollege.color}77)` : 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="text-2xl">{selectedCollege?.emoji || '🛒'}</span>
              {selectedCollege?.shortName} Marketplace
            </div>
            <h1 className="text-3xl font-extrabold">Campus Buy & Sell 🛒</h1>
            <p className="text-sm text-white/80 mt-1 max-w-md">
              Buy & sell books, electronics, furniture and more — exclusively with fellow <strong>{selectedCollege?.shortName || 'campus'}</strong> students. Zero commissions.
            </p>
          </div>
          <button
            onClick={() => { setEditListing(null); setNewItem({ title: '', price: '', category: 'books', condition: 'Good', description: '' }); setShowSell(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm border border-white/30 transition-colors"
          >
            <Plus className="w-4 h-4" /> Sell an Item
          </button>
        </div>
      </div>

      {/* Sell / Edit Modal */}
      {showSell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editListing ? 'Edit Listing' : 'List an Item for Sale'}
              </h3>
              <button onClick={() => { setShowSell(false); setEditListing(null); }} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            {user ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(CATEGORY_ICONS).map(([key, { label, icon: Icon }]) => (
                    <button
                      key={key}
                      onClick={() => setNewItem(p => ({ ...p, category: key }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        newItem.category === key
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>
                <input
                  type="text" placeholder="Item title..."
                  value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number" placeholder="Price (₹)"
                    value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    value={newItem.condition} onChange={e => setNewItem(p => ({ ...p, condition: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>Like New</option><option>Good</option><option>Fair</option><option>For Parts</option>
                  </select>
                </div>
                <textarea
                  rows={3} placeholder="Description..."
                  value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddListing} disabled={submitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editListing ? 'Update Listing' : 'Publish Listing'}
                </button>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Please log in to list an item.</p>
                <button onClick={() => { setShowSell(false); setCurrentTab('login'); }}
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Log In</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Category */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search in ${selectedCollege?.shortName || 'campus'} marketplace...`}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All Items ({listings.length} real + 1 example)
        </button>
        {Object.entries(CATEGORY_ICONS).map(([key, { label, icon: Icon }]) => {
          const count = listings.filter(i => i.category === key).length;
          if (count === 0) return null;
          return (
            <button key={key} onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3 h-3" /> {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayed.map(item => {
            const catInfo = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.other;
            const CatIcon = catInfo.icon;
            const isOwner = myId && String(item.sellerId) === myId;
            const isDeleting = deletingId === item._id;
            return (
              <div
                key={item._id || item.id}
                className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-indigo-400/50 transition-all flex flex-col cursor-pointer group ${item.isSold || item.sold ? 'opacity-60' : ''}`}
                onClick={() => setShowDetail(item)}
              >
                <div className={`h-1.5 w-full rounded-t-2xl`} style={{ background: item.isSold ? '#94a3b8' : undefined, backgroundColor: !item.isSold ? undefined : undefined }}>
                  <div className={`h-full w-full rounded-t-2xl ${catInfo.bg}`} />
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${catInfo.bg} ${catInfo.color} border border-current/20`}>
                      <CatIcon className="w-3 h-3" /> {catInfo.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.isExample && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                          EXAMPLE PRODUCT
                        </span>
                      )}
                      {isOwner && !item.isExample && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                          Yours
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (item.isSold || item.sold) ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        item.condition === 'Like New' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {(item.isSold || item.sold) ? 'SOLD' : item.condition}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1 mb-4">{item.description}</p>
                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {(item.tags || []).slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/80">#{tag}</span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">₹{(item.price || 0).toLocaleString()}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {item.location}
                        <span className="mx-1">·</span>
                        <Clock className="w-2.5 h-2.5" /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{item.sellerName || item.seller}</div>
                      <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold justify-end">
                        <Star className="w-3 h-3 fill-amber-400" /> {item.sellerRating || 5.0}
                      </div>
                    </div>
                  </div>

                  {/* Owner actions inline */}
                  {isOwner && !item.isExample && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {displayed.length === 0 && !loading && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No listings found. Be the first to sell something!</p>
        </div>
      )}

      {/* Item Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">{showDetail.title}</h2>
                {showDetail.isExample && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    EXAMPLE PRODUCT — for demonstration only
                  </span>
                )}
              </div>
              <button onClick={() => setShowDetail(null)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{(showDetail.price || 0).toLocaleString()}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                showDetail.condition === 'Like New' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              }`}>{showDetail.condition}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{showDetail.description}</p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{showDetail.sellerName || showDetail.seller}</div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="w-3 h-3" /> {showDetail.location}
                <span className="mx-1">·</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {showDetail.sellerRating || 5.0} Seller Rating
              </div>
            </div>

            {!(showDetail.isSold || showDetail.sold) && (
              <div className="flex gap-3">
                {/* Contact Seller — real action */}
                {!showDetail.isExample && myId && String(showDetail.sellerId) !== myId && (
                  <button
                    onClick={() => handleContactSeller(showDetail)}
                    disabled={contactingId === String(showDetail._id) || contactedIds.has(String(showDetail._id))}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {contactingId === String(showDetail._id)
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Contacting...</>
                      : contactedIds.has(String(showDetail._id))
                      ? '✅ Request Sent'
                      : <><MessageCircle className="w-4 h-4" /> Contact Seller via WhatsApp</>
                    }
                  </button>
                )}
                {showDetail.isExample && (
                  <div className="flex-1 py-3 rounded-xl bg-amber-100 text-amber-700 font-bold text-sm text-center">
                    Example — cannot contact
                  </div>
                )}
                {/* Owner edit/delete in detail modal */}
                {myId && String(showDetail.sellerId) === myId && !showDetail.isExample && (
                  <>
                    <button onClick={() => openEditModal(showDetail)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 transition-all">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(showDetail)}
                      disabled={deletingId === showDetail._id}
                      className="p-3 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-50">
                      {deletingId === showDetail._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
