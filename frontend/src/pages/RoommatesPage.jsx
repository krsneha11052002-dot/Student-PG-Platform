import React, { useState, useMemo } from 'react';
import { useCollege } from '../context/CollegeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  Users, Sparkles, Search, Filter, BookOpen, Coffee, Moon, Sun,
  Music, Dumbbell, Utensils, Wifi, MessageCircle, Heart, X, Star,
  GraduationCap, MapPin, CheckCircle, UserPlus, RefreshCw
} from 'lucide-react';

// Mock roommate data per college area
const generateRoommates = (college) => {
  const area = college?.area || 'Delhi';
  const name = college?.shortName || 'Campus';
  return [
    {
      id: 'r1', name: 'Aarav Sharma', age: 20, gender: 'Male', year: '2nd Year',
      department: 'Computer Science', college: name, area, matchScore: 96,
      avatar: '👨‍💻', lifestyle: ['Night Owl', 'Quiet Study', 'Non-Smoker'],
      lookingFor: 'Single Room / 2-Sharing', budget: '₹8,000–₹12,000/mo',
      bio: `CS student near ${area}. Love coding late nights. Clean & tidy. Looking for a fellow geek!`,
      verified: true, posted: '2 hours ago',
    },
    {
      id: 'r2', name: 'Priya Mehta', age: 21, gender: 'Female', year: '3rd Year',
      department: 'Economics', college: name, area, matchScore: 91,
      avatar: '👩‍🎓', lifestyle: ['Early Bird', 'Gym Freak', 'Vegetarian'],
      lookingFor: '2-Sharing Room (Girls PG)', budget: '₹7,000–₹10,000/mo',
      bio: `Economics student. Wake up early, gym by 6 AM. Prefer clean, girls-only PG near ${area}.`,
      verified: true, posted: '5 hours ago',
    },
    {
      id: 'r3', name: 'Rohan Das', age: 22, gender: 'Male', year: '4th Year',
      department: 'Mechanical Engineering', college: name, area, matchScore: 87,
      avatar: '🧑‍🔬', lifestyle: ['Night Owl', 'Gamer', 'Non-Veg OK'],
      lookingFor: '3-Sharing Room', budget: '₹5,000–₹8,000/mo',
      bio: `Final year Mech. Laid-back roommate, love gaming on weekends. Budget-conscious near ${area}.`,
      verified: false, posted: '1 day ago',
    },
    {
      id: 'r4', name: 'Sneha Kapoor', age: 20, gender: 'Female', year: '1st Year',
      department: 'English Literature', college: name, area, matchScore: 84,
      avatar: '📚', lifestyle: ['Early Bird', 'Bookworm', 'Vegetarian', 'Non-Smoker'],
      lookingFor: 'Single Room (Girls PG)', budget: '₹9,000–₹14,000/mo',
      bio: `Lit student, avid reader, tea lover. Need quiet environment near ${area}. Serious about studies.`,
      verified: true, posted: '2 days ago',
    },
    {
      id: 'r5', name: 'Karthik Rajan', age: 23, gender: 'Male', year: 'M.Tech 1st Year',
      department: 'Data Science', college: name, area, matchScore: 79,
      avatar: '🤖', lifestyle: ['Night Owl', 'Quiet Study', 'Tea Lover'],
      lookingFor: '2-Sharing Room', budget: '₹10,000–₹15,000/mo',
      bio: `PG student in Data Science. Organized, introverted. Looking for serious study environment near ${area}.`,
      verified: true, posted: '3 days ago',
    },
    {
      id: 'r6', name: 'Aisha Khan', age: 21, gender: 'Female', year: '2nd Year',
      department: 'Architecture', college: name, area, matchScore: 75,
      avatar: '🎨', lifestyle: ['Night Owl', 'Creative', 'Music Lover'],
      lookingFor: '2-Sharing Room (Girls PG)', budget: '₹8,000–₹12,000/mo',
      bio: `Architecture student — expect late-night studio sessions! Creative space, chill vibes near ${area}.`,
      verified: false, posted: '4 days ago',
    },
  ];
};

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

export const RoommatesPage = ({ setCurrentTab }) => {
  const { selectedCollege, changeCollege } = useCollege();
  const { user } = useAuth();
  const { showSuccess } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [likedIds, setLikedIds] = useState([]);
  const [messagedIds, setMessagedIds] = useState([]);

  // Form states for adding a custom roommate profile
  const [lookingFor, setLookingFor] = useState('2-Sharing Room');
  const [budget, setBudget] = useState('');
  const [bio, setBio] = useState('');
  const [selectedFormTraits, setSelectedFormTraits] = useState([]);
  const [customRoommates, setCustomRoommates] = useState([]);

  const defaultRoommates = useMemo(() => generateRoommates(selectedCollege), [selectedCollege]);
  const allRoommates = useMemo(() => [...customRoommates, ...defaultRoommates], [customRoommates, defaultRoommates]);

  const filtered = useMemo(() => {
    return allRoommates.filter(r => {
      const matchesSearch = !searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.lifestyle.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGender = genderFilter === 'All' || r.gender === genderFilter;
      const matchesTraits = selectedTraits.length === 0 ||
        selectedTraits.every(t => r.lifestyle.includes(t));
      return matchesSearch && matchesGender && matchesTraits;
    });
  }, [allRoommates, searchQuery, genderFilter, selectedTraits]);

  const toggleTrait = (trait) => {
    setSelectedTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const collegeColor = selectedCollege?.color || '#4f46e5';

  return (
    <div className="space-y-8 pb-16">

      {/* Header Banner */}
      <div
        className="p-8 rounded-3xl text-white relative overflow-hidden shadow-xl"
        style={{ background: `linear-gradient(135deg, #0f172a, #1e1b4b, ${collegeColor}99)` }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI-Powered Matching
              </span>
              {selectedCollege && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-white/20"
                  style={{ background: `${collegeColor}30`, color: 'white' }}>
                  <span>{selectedCollege.emoji}</span> {selectedCollege.shortName}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold">
              {selectedCollege
                ? `Find Roommates near ${selectedCollege.shortName}`
                : 'Find Your Perfect Roommate'}
              <span className="ml-2">🤝</span>
            </h1>
            <p className="text-xs text-indigo-200 max-w-lg">
              {selectedCollege
                ? `Browse verified students from ${selectedCollege.name} looking for shared accommodation near ${selectedCollege.area}.`
                : 'Browse student roommate profiles curated by AI based on your lifestyle compatibility.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowPostForm(true)}
              className="px-5 py-2.5 rounded-2xl bg-white font-bold text-xs shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
              style={{ color: collegeColor }}
            >
              <UserPlus className="w-4 h-4" /> Post My Roommate Profile
            </button>
            {selectedCollege && (
              <button
                onClick={changeCollege}
                className="px-4 py-2 rounded-xl bg-white/15 text-white/90 font-semibold text-xs border border-white/20 hover:bg-white/25 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Change College
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Match Score Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <strong>AI Match Scores</strong> are calculated based on your lifestyle preferences, budget, study habits, and college proximity. 
          {user ? ' Your profile is active — update it in the Dashboard.' : ' Log in to activate personalized matching.'}
        </p>
        {!user && (
          <button
            onClick={() => setCurrentTab('login')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
          >
            Log In
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Filter className="w-4 h-4 text-indigo-500" /> Filter Roommates
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, department, lifestyle..."
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </div>
          {/* Gender */}
          <div className="flex items-center gap-1.5">
            {['All', 'Male', 'Female'].map(g => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  genderFilter === g
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Lifestyle Trait Filters */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Filter by Lifestyle Traits</p>
          <div className="flex flex-wrap gap-1.5">
            {LIFESTYLE_OPTIONS.map(({ label, icon: Icon }) => {
              const active = selectedTraits.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => toggleTrait(label)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                    active
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  style={active ? { background: collegeColor, borderColor: collegeColor } : {}}
                >
                  <Icon className="w-3 h-3" /> {label}
                  {active && <X className="w-2.5 h-2.5 ml-0.5" />}
                </button>
              );
            })}
            {selectedTraits.length > 0 && (
              <button
                onClick={() => setSelectedTraits([])}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-red-200 text-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-700"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">
          <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> roommate{filtered.length !== 1 ? 's' : ''} found
          {selectedCollege && <span className="text-indigo-500 font-semibold"> · near {selectedCollege.area}</span>}
        </p>
      </div>

      {/* Roommate Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Roommates Found</h3>
          <p className="text-xs text-slate-500">Try removing some lifestyle filters or broadening your search.</p>
          <button onClick={() => { setSelectedTraits([]); setSearchQuery(''); setGenderFilter('All'); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rm) => {
            const liked = likedIds.includes(rm.id);
            const messaged = messagedIds.includes(rm.id);
            return (
              <div
                key={rm.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 hover:shadow-lg hover:border-indigo-400/50 transition-all group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-slate-100 dark:bg-slate-800 shrink-0">
                      {rm.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{rm.name}</h3>
                        {rm.verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                        )}
                        {!rm.isReal && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.25 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                            Example Post
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{rm.year} · {rm.department}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] text-indigo-500 font-medium">{rm.area}</span>
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
                  {rm.lifestyle.map(trait => (
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
                  <button
                    onClick={() => setMessagedIds(prev => prev.includes(rm.id) ? prev : [...prev, rm.id])}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      messaged
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                        : 'text-white shadow-sm hover:opacity-90'
                    }`}
                    style={!messaged ? { background: collegeColor } : {}}
                  >
                    {messaged ? <><CheckCircle className="w-3.5 h-3.5" /> Request Sent!</> : <><MessageCircle className="w-3.5 h-3.5" /> Send Request</>}
                  </button>
                  <button
                    onClick={() => setLikedIds(prev => prev.includes(rm.id) ? prev.filter(i => i !== rm.id) : [...prev, rm.id])}
                    className={`p-2 rounded-xl border transition-all ${
                      liked
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-700 text-red-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-red-300 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                  </button>
                </div>

                {/* Posted Time */}
                <p className="text-[10px] text-slate-400 text-right">{rm.posted}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Profile Modal */}
      {showPostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" /> Post Your Roommate Profile
              </h2>
              <button onClick={() => setShowPostForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {user ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">What are you looking for?</label>
                  <select 
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
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
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. ₹7,000 – ₹12,000/mo"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Lifestyle Traits</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-slate-250 dark:border-slate-750 rounded-xl">
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
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={`Tell potential roommates about yourself near ${selectedCollege?.area || 'campus'}...`}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none" 
                  />
                </div>
                <button
                  onClick={() => {
                    const newProfile = {
                      id: `r-custom-${Date.now()}`,
                      name: user.name || 'Anonymous Student',
                      age: 20,
                      gender: user.gender || 'Male',
                      year: '1st Year',
                      department: 'Student',
                      college: selectedCollege?.shortName || 'Campus',
                      area: selectedCollege?.area || 'Nearby',
                      matchScore: 100,
                      avatar: '🎓',
                      lifestyle: selectedFormTraits.length > 0 ? selectedFormTraits : ['Non-Smoker', 'Quiet Study'],
                      lookingFor,
                      budget: budget || '₹8,000–₹12,000/mo',
                      bio: bio || 'Looking for a clean and friendly roommate.',
                      verified: true,
                      posted: 'Just now',
                      isReal: true
                    };
                    setCustomRoommates(prev => [newProfile, ...prev]);
                    setShowPostForm(false);
                    showSuccess('Your roommate profile has been posted successfully! 🎉');
                    // Reset form fields
                    setBio('');
                    setBudget('');
                    setSelectedFormTraits([]);
                  }}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
                  style={{ background: collegeColor }}
                >
                  🚀 Post My Profile
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3 py-4">
                <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Please log in as a Verified Student to post a roommate profile.</p>
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
