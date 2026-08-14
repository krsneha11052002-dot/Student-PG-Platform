import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Image, Tag, DollarSign, MapPin, Calendar, AlertTriangle, Send, Loader2 } from 'lucide-react';

export const CreatePostModal = ({ isOpen, onClose, collegeShortName, onPostCreated, editingPost }) => {
  const { token } = useAuth();
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
  const [loading, setLoading] = useState(false);
  const [emergencyIssue, setEmergencyIssue] = useState('Security / Theft Alert');
  
  const [imageSourceType, setImageSourceType] = useState('file');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("File is too large. Max size is 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (editingPost) {
      setCategory(editingPost.category || 'feed');
      setSubCategory(editingPost.subCategory || 'Academics');
      setTitle(editingPost.title || '');
      setContent(editingPost.content || '');
      setImageUrl(editingPost.imageUrl || '');
      setTagsInput(editingPost.tags?.join(', ') || '');
      
      if (editingPost.imageUrl) {
        setImageSourceType(editingPost.imageUrl.startsWith('data:image') ? 'file' : 'url');
      }
      
      if (editingPost.marketplace) {
        setPrice(editingPost.marketplace.price || '');
        setCondition(editingPost.marketplace.condition || 'Like New');
        setWhatsapp(editingPost.marketplace.contactWhatsApp || '');
      }
      if (editingPost.eventDetails) {
        setEventDate(editingPost.eventDetails.eventDate || '');
        setEventVenue(editingPost.eventDetails.eventVenue || editingPost.eventDetails.venue || '');
        setEventOrganizer(editingPost.eventDetails.eventOrganizer || editingPost.eventDetails.organizer || '');
      }
      if (editingPost.lostFound) {
        setLostFoundStatus(editingPost.lostFound.status || 'LOST');
        setLostLocation(editingPost.lostFound.location || '');
        setContactPhone(editingPost.lostFound.contactPhone || '');
      }
      if (editingPost.emergencyDetails) {
        setEmergencyIssue(editingPost.emergencyDetails.safetyType || 'Security / Theft Alert');
        setContactPhone(editingPost.emergencyDetails.contactPhone || '');
      }
    }
  }, [editingPost]);

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
    if (!token) {
      alert("Please login to post");
      return;
    }

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
      const url = editingPost ? `/api/community/posts/${editingPost._id || editingPost.id}` : '/api/community/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
                {editingPost ? 'Edit Community Post' : 'Create Community Post'}
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

          {/* Photo Input (Gallery Upload or URL) */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-indigo-500" /> Photo (Optional)
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Upload file or paste URL</span>
            </label>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageSourceType('file')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    imageSourceType === 'file'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  📁 Select from Gallery
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceType('url')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    imageSourceType === 'url'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  🔗 Paste Web Link
                </button>
              </div>

              {imageSourceType === 'file' ? (
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Choose Image File</span>
                    <span className="text-[9px] text-slate-400">Max size 8MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  
                  {imageUrl && imageUrl.startsWith('data:image') && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-0 right-0 p-0.5 bg-black/60 text-white hover:bg-black/80 rounded-bl-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="url"
                  value={imageUrl && !imageUrl.startsWith('data:image') ? imageUrl : ''}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or web link"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
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

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {editingPost ? 'Update Post' : 'Publish Post'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
