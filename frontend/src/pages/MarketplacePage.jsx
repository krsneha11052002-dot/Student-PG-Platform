import React, { useState, useMemo } from 'react';
import { useCollege } from '../context/CollegeContext';
import {
  ShoppingBag, Plus, Search, Tag, Clock, MessageCircle, 
  Filter, Star, Package, BookOpen, Sofa, Laptop, 
  Bike, Shirt, ChevronRight, MapPin, X
} from 'lucide-react';

const CATEGORY_ICONS = {
  books: { icon: BookOpen, label: 'Books & Notes', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  electronics: { icon: Laptop, label: 'Electronics', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  furniture: { icon: Sofa, label: 'Furniture', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  clothing: { icon: Shirt, label: 'Clothing', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  transport: { icon: Bike, label: 'Transport', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  other: { icon: Package, label: 'Other Items', color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

const getCollegeListings = (college) => {
  if (!college) return [];
  const area = college.shortName;
  const collegeArea = college.area;
  return [
    {
      id: 'item_1', category: 'books', title: `Complete ${area} Study Notes + PYQs (4 Years)`,
      price: 800, condition: 'Good', seller: `${area} Final Year`, sellerRating: 4.9,
      location: collegeArea, time: '2 hours ago', description: `Handwritten + printed notes for all semesters. All major subjects covered. Highly useful for ${area} exams. Selling because I graduated.`,
      tags: ['Notes', 'PYQs', area], image: null, sold: false
    },
    {
      id: 'item_2', category: 'electronics', title: 'HP Laptop i5 10th Gen — Perfect for Engineering Students',
      price: 28000, condition: 'Like New', seller: `${area} CS 3rd Year`, sellerRating: 4.7,
      location: collegeArea, time: '5 hours ago', description: `Used for just 1 year. 8GB RAM, 512GB SSD. Perfect for coding, Figma, and remote access. Buying a MacBook, selling this urgently.`,
      tags: ['Laptop', 'Electronics', area], image: null, sold: false
    },
    {
      id: 'item_3', category: 'furniture', title: 'Ergonomic Study Chair + Portable Desk Bundle',
      price: 3500, condition: 'Good', seller: `Near ${collegeArea} PG`, sellerRating: 4.5,
      location: `${collegeArea} Area`, time: '1 day ago', description: "Great study setup. Adjustable height desk and chair. I'm moving out of my PG so selling urgently. Self pickup preferred.",
      tags: ['Furniture', 'Study Setup'], image: null, sold: false
    },
    {
      id: 'item_4', category: 'electronics', title: 'Mini Fridge (Godrej, 80L) — Works Perfectly',
      price: 5500, condition: 'Good', seller: `${area} Student`, sellerRating: 4.8,
      location: collegeArea, time: '2 days ago', description: 'Selling my PG room fridge. Moving back home. Works perfectly, no issues. 1 year old. Will give for ₹5500 negotiable. WhatsApp only.',
      tags: ['Fridge', 'Electronics', 'PG Life'], image: null, sold: false
    },
    {
      id: 'item_5', category: 'books', title: `Data Structures & Algorithms + GATE Prep Books`,
      price: 450, condition: 'Fair', seller: `${area} MTech Student`, sellerRating: 4.6,
      location: collegeArea, time: '3 days ago', description: 'Set of 6 books including Cormen, Sedgewick, and 3 GATE prep books. Some highlighting on 2 books. Great for placements prep.',
      tags: ['Books', 'GATE', 'DSA'], image: null, sold: true
    },
    {
      id: 'item_6', category: 'transport', title: 'Hero Splendor Bike — Daily College Commute Ready',
      price: 42000, condition: 'Good', seller: `${area} Graduating`, sellerRating: 5.0,
      location: `${collegeArea} Area`, time: '4 days ago', description: '2022 model, 18,000 km done. All papers clear. Serviced 2 months ago. Ideal for commuting from PG to campus. Selling before I relocate to Bangalore.',
      tags: ['Bike', 'Transport', 'Graduating'], image: null, sold: false
    }
  ];
};

export const MarketplacePage = ({ setCurrentTab }) => {
  const { selectedCollege, changeCollege } = useCollege();
  const [customListings, setCustomListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSell, setShowSell] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', price: '', category: 'books', condition: 'Good', description: '' });
  const [showDetail, setShowDetail] = useState(null);

  const defaultListings = useMemo(() => getCollegeListings(selectedCollege), [selectedCollege]);
  const listings = useMemo(() => [...customListings, ...defaultListings], [customListings, defaultListings]);

  const displayed = listings.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddListing = () => {
    if (!newItem.title || !newItem.price) return;
    const newListing = {
      id: `item_${Date.now()}`,
      category: newItem.category,
      title: newItem.title,
      price: Number(newItem.price),
      condition: newItem.condition,
      seller: 'You',
      sellerRating: 5.0,
      location: selectedCollege?.area || 'Campus Area',
      time: 'Just now',
      description: newItem.description,
      tags: [selectedCollege?.shortName || 'Campus'],
      image: null,
      sold: false,
      isReal: true
    };
    setCustomListings([newListing, ...customListings]);
    setShowSell(false);
    setNewItem({ title: '', price: '', category: 'books', condition: 'Good', description: '' });
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
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowSell(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm border border-white/30 transition-colors"
            >
              <Plus className="w-4 h-4" /> Sell an Item
            </button>
            <button
              onClick={changeCollege}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 font-semibold text-xs border border-white/20 transition-colors"
            >
              🔄 Change College
            </button>
          </div>
        </div>
      </div>

      {/* Sell Item Modal */}
      {showSell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">List an Item for Sale</h3>
              <button onClick={() => setShowSell(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CATEGORY_ICONS).map(([key, { label, icon: Icon, bg, color }]) => (
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
              type="text"
              placeholder="Item title..."
              value={newItem.title}
              onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Price (₹)"
                value={newItem.price}
                onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newItem.condition}
                onChange={e => setNewItem(p => ({ ...p, condition: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>For Parts</option>
              </select>
            </div>

            <textarea
              rows={3}
              placeholder="Description..."
              value={newItem.description}
              onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleAddListing}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              Publish Listing
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search in ${selectedCollege?.shortName || 'campus'} marketplace...`}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All Items ({listings.length})
        </button>
        {Object.entries(CATEGORY_ICONS).map(([key, { label, icon: Icon }]) => {
          const count = listings.filter(i => i.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3 h-3" /> {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayed.map(item => {
          const catInfo = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.other;
          const CatIcon = catInfo.icon;
          return (
            <div
              key={item.id}
              className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-indigo-400/50 transition-all flex flex-col cursor-pointer group ${item.sold ? 'opacity-60' : ''}`}
              onClick={() => setShowDetail(item)}
            >
              {/* Category Color Band */}
              <div className={`h-1.5 w-full rounded-t-2xl ${catInfo.bg.replace('/10', '')} bg-opacity-100`}
                style={{ background: item.sold ? '#94a3b8' : undefined }}
              />

              <div className="p-5 flex-1 flex flex-col">
                {/* Category Badge + Condition */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${catInfo.bg} ${catInfo.color} border border-current/20`}>
                    <CatIcon className="w-3 h-3" /> {catInfo.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!item.isReal && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                        Example Product
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.sold ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      item.condition === 'Like New' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.sold ? 'SOLD' : item.condition}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1 mb-4">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {item.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/80">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                      ₹{item.price.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {item.location}
                      <span className="mx-1">·</span>
                      <Clock className="w-2.5 h-2.5" /> {item.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{item.seller}</div>
                    <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold justify-end">
                      <Star className="w-3 h-3 fill-amber-400" /> {item.sellerRating}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayed.length === 0 && (
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
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">{showDetail.title}</h2>
              <button onClick={() => setShowDetail(null)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{showDetail.price.toLocaleString()}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                showDetail.condition === 'Like New' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              }`}>{showDetail.condition}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{showDetail.description}</p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{showDetail.seller}</div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="w-3 h-3" /> {showDetail.location}
                <span className="mx-1">·</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {showDetail.sellerRating} Seller Rating
              </div>
            </div>
            {!showDetail.sold && (
              <button className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Contact Seller via WhatsApp
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
