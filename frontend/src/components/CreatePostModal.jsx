import React, { useState } from 'react';
import { X, Sparkles, Image, Tag, DollarSign, MapPin, Calendar, AlertTriangle, Send } from 'lucide-react';

export const CreatePostModal = ({ isOpen, onClose, collegeShortName, onPostCreated }) => {
  const [category, setCategory] = useState('feed');
  const [subCategory, setSubCategory] = useState('Academics');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // Category specific fields
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Like New');
  const [whatsapp, setWhatsapp] = useState('');
  
  const [lostFoundStatus, setLostFoundStatus] = useState('LOST');
  const [lostLocation, setLostLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventOrganizer, setEventOrganizer] = useState('');

  const [aiDetecting, setAiDetecting] = useState(false);

  const handleAutoCategory = async () => {
    if (!title && !content) return;
    setAiDetecting(true);
    try {
      const res = await fetch('/api/ai/community/auto-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (data.success && data.suggestedCategory) {
        setCategory(data.suggestedCategory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiDetecting(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    if (!tags.includes(collegeShortName)) tags.push(collegeShortName);

    const postPayload = {
      collegeShortName,
      category,
      subCategory: category === 'forum' ? subCategory : 'General',
      title,
      content,
      imageUrl: imageUrl.trim() || null,
      tags,
      authorName: 'Verified Student',
      authorBadge: 'Community Member'
    };

    if (category === 'marketplace') {
      postPayload.marketplace = {
        price: Number(price) || 0,
        condition,
        contactWhatsApp: whatsapp || contactPhone
      };
    } else if (category === 'lost_found') {
      postPayload.lostFound = {
        status: lostFoundStatus,
        location: lostLocation || collegeShortName,
        contactPhone
      };
    } else if (category === 'event') {
      postPayload.eventDetails = {
        eventDate: eventDate || 'TBD',
        venue: eventVenue || collegeShortName,
        organizer: eventOrganizer || 'Student Body'
      };
    } else if (category === 'emergency') {
      postPayload.emergencyDetails = {
        isUrgent: true,
        contactPhone,
        safetyType: emergencyIssue
      };
    }

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload)
      });
      const data = await res.json();
      if (data.success) {
        onPostCreated && onPostCreated(data.post);
        onClose();
      }
    } catch (err) {
      console.error(err);
      onPostCreated && onPostCreated({ ...postPayload, id: 'post_' + Date.now(), createdAt: new Date().toISOString(), likesCount: 0, comments: [] });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Create Community Post
              </h2>
              <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider">
                {collegeShortName} Verified Campus
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Post Category Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Post Category</label>
              <button
                type="button"
                onClick={handleAutoCategory}
                disabled={aiDetecting}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900 flex items-center gap-1 hover:bg-indigo-100"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{aiDetecting ? 'Detecting...' : '✨ AI Auto-Detect Category'}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'feed', label: '📰 Student Feed' },
                { id: 'forum', label: '💬 Forum Q&A' },
                { id: 'marketplace', label: '🛒 Buy & Sell' },
                { id: 'lost_found', label: '🔍 Lost & Found' },
                { id: 'event', label: '🎉 College Event' },
                { id: 'emergency', label: '🚨 SOS Alert' },
              ].map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                    category === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-category for Forum */}
          {category === 'forum' && (
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Forum Topic</label>
              <select
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="Academics">Academics & Exams</option>
                <option value="PG Advice">PG & Accommodation Advice</option>
                <option value="Careers">Internships & Placements</option>
                <option value="Campus Life">Campus Life & Canteens</option>
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Selling study table near Kamla Nagar / Lost black backpack"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Content */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description / Post Details</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Provide complete details for campus members..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
              <Image className="w-3.5 h-3.5 text-indigo-500" /> Photo URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or image link"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category-Specific Form Inputs */}
          {category === 'marketplace' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="font-bold block mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">WhatsApp / Phone</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="+91 98765..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          {category === 'lost_found' && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="font-bold block mb-1">Status</label>
                <select
                  value={lostFoundStatus}
                  onChange={e => setLostFoundStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="LOST">🔍 LOST ITEM</option>
                  <option value="FOUND">🎉 FOUND ITEM</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Campus Location</label>
                <input
                  type="text"
                  value={lostLocation}
                  onChange={e => setLostLocation(e.target.value)}
                  placeholder="e.g. Canteen / Library"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+91 98765..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          {category === 'event' && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="font-bold block mb-1">Event Date</label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  placeholder="e.g. 24th Aug 2026"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Venue</label>
                <input
                  type="text"
                  value={eventVenue}
                  onChange={e => setEventVenue(e.target.value)}
                  placeholder="e.g. Main Auditorium"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Organizer</label>
                <input
                  type="text"
                  value={eventOrganizer}
                  onChange={e => setEventOrganizer(e.target.value)}
                  placeholder="e.g. Music Society"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          {category === 'emergency' && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900 space-y-2">
              <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> URGENT CAMPUS EMERGENCY BROADCAST
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Issue Type</label>
                  <select
                    value={emergencyIssue}
                    onChange={e => setEmergencyIssue(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border bg-white dark:bg-slate-900"
                  >
                    <option value="Security / Theft Alert">Security / Theft Alert</option>
                    <option value="Medical Assistance">Medical Assistance</option>
                    <option value="Late Night Transport / Safety">Late Night Transport / Safety</option>
                    <option value="Campus Harassment">Campus Harassment</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="Immediate Callback Number"
                    className="w-full px-2 py-1 rounded-lg border bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. PG Tips, Housing, Exam Notes"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 ${
                category === 'emergency' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Posting...' : 'Publish to Campus Community'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
