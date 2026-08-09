import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from './Toast';
import { 
  CheckCircle2, Heart, Star, MapPin, Wifi, Shield, Utensils, Zap, Users, ArrowRight, Eye, Building2 
} from 'lucide-react';

export const PGCard = ({ pg, onSelect }) => {
  const { user, toggleSavePG } = useAuth();
  const { addToCompare, removeFromCompare, isComparing } = useCompare();
  const { showSuccess, showInfo } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);

  const pgId = pg._id || pg.id;
  const isSaved = user?.savedPGs?.includes(pgId);
  const comparing = isComparing(pgId);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (user) {
      toggleSavePG(pgId);
      if (!isSaved) {
        showSuccess(`Added "${pg.title}" to your saved wishlist! ❤️`);
      } else {
        showInfo(`Removed "${pg.title}" from saved wishlist.`);
      }
    } else {
      showInfo('Please log in as a student to save PG listings!');
    }
  };

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    if (comparing) {
      removeFromCompare(pgId);
      showInfo(`Removed "${pg.title}" from comparison drawer.`);
    } else {
      addToCompare(pgId);
      showSuccess(`Added "${pg.title}" to compare list! 📊`);
    }
  };

  const getGenderStyle = (gender) => {
    if (gender === 'Girls Only') return 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30';
    if (gender === 'Boys Only') return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
  };

  const mainImage = (pg.images && pg.images.length > 0) 
    ? pg.images[0] 
    : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

  return (
    <div 
      onClick={() => onSelect(pg)}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Top Image Container with Blur loading */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
            <Building2 className="w-8 h-8 text-slate-400 opacity-50" />
          </div>
        )}
        
        <img 
          src={mainImage} 
          alt={pg.title} 
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-108 transition-all duration-700 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/30" />

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
            {pg.isVerified && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md border border-white/20">
                <CheckCircle2 className="w-3 h-3 text-white" /> VERIFIED
              </span>
            )}
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-md backdrop-blur-md ${getGenderStyle(pg.gender)}`}>
              {pg.gender}
            </span>
          </div>

          {/* Wishlist Heart */}
          <button
            onClick={handleFavoriteClick}
            className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
              isSaved 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-110' 
                : 'bg-slate-900/60 text-white hover:bg-rose-500 hover:text-white hover:scale-110'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save to Favorites'}
          >
            <Heart className={`w-4 h-4 transition-transform ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay Details */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs z-10">
          <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 text-[11px] border border-white/10">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> {pg.sharingCapacity || pg.roomType}
          </span>
          <div className="flex items-center gap-1 bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow-md">
            <Star className="w-3.5 h-3.5 fill-slate-950" /> {pg.rating || 4.8}
            <span className="text-[10px] font-semibold text-slate-900 opacity-80">({pg.reviewsCount || 12})</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Title & Compare */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-1">
              {pg.title}
            </h3>
            
            <label 
              className="flex items-center gap-1 cursor-pointer select-none shrink-0" 
              onClick={e => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={comparing}
                onChange={handleCompareToggle}
                className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 transition-all cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-400 hover:text-indigo-500 transition-colors">Compare</span>
            </label>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{pg.location}</span>
          </div>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pg.amenities?.slice(0, 3).map((amenity, idx) => (
              <span 
                key={idx} 
                className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-800"
              >
                {amenity}
              </span>
            ))}
            {pg.amenities?.length > 3 && (
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-md border border-indigo-200/50 dark:border-indigo-900/50">
                +{pg.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Rent & Action */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ₹{pg.pricePerMonth?.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">/mo</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
              ● {pg.occupancyStatus || 'Beds Available'}
            </span>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onSelect(pg); }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 text-slate-700 dark:text-slate-200 group-hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
