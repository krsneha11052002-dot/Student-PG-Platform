import React from 'react';
import { Building2, Sparkles, Shield, Heart, MapPin, Phone, Mail } from 'lucide-react';

export const Footer = ({ setCurrentTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white font-sans">
                StaySmart <span className="text-indigo-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering students with verified Paying Guest accommodations, transparent pricing, biometric safety standards, and AI room matching.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-indigo-950 text-indigo-300 text-[11px] px-2.5 py-1 rounded-full border border-indigo-800/60 font-mono">
                <Sparkles className="w-3 h-3 text-indigo-400" /> AI Housing v1.0
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 text-[11px] px-2.5 py-1 rounded-full border border-emerald-800/60 font-mono">
                <Shield className="w-3 h-3 text-emerald-400" /> Verified Shield
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => setCurrentTab('search')} className="hover:text-indigo-400 transition-colors">
                  Browse All PGs & Hostels
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('roommates')} className="hover:text-indigo-400 transition-colors">
                  Find Roommates
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('reviews')} className="hover:text-indigo-400 transition-colors">
                  PG Reviews & Ratings
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('community')} className="hover:text-indigo-400 transition-colors">
                  Student Community
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('marketplace')} className="hover:text-indigo-400 transition-colors">
                  Student Marketplace
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              University Hubs
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-indigo-400" /> North Campus University Zone</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-indigo-400" /> South Campus Education Hub</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-indigo-400" /> Knowledge Park Tech Sector</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-indigo-400" /> Science & Medical Institute District</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Student Safety & Support
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Need urgent accommodation help or landlord verification support?
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> 24/7 Helpline: +91 1800-SMART-STAY
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> support@staysmart.ai
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 StaySmart AI Platform. Built for Students, Owners & Platform Admins.</p>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for frictionless student living</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
