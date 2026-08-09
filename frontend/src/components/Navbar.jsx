import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCollege } from '../context/CollegeContext';
import { CollegeSelectScreen } from './CollegeSelectScreen';
import { 
  Building2, Sun, Moon, Sparkles, UserCheck, ShieldCheck, 
  LogOut, LogIn, UserPlus, Home, Search, LayoutDashboard, 
  ChevronDown, CheckCircle2, Users, ShoppingBag, RefreshCw,
  Star, UserRoundSearch, Heart, Menu, X, MessageSquare
} from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { user, logout, loginAsDemo } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { selectedCollege } = useCollege();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showCollegeChange, setShowCollegeChange] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-500/20"><UserCheck className="w-3.5 h-3.5" /> Student</span>;
      case 'owner':
        return <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs px-2.5 py-1 rounded-full font-bold border border-purple-500/20"><Building2 className="w-3.5 h-3.5" /> PG Owner</span>;
      case 'admin':
        return <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-500/20"><ShieldCheck className="w-3.5 h-3.5" /> Admin</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs px-2.5 py-1 rounded-full font-semibold">Guest</span>;
    }
  };

  const handleDemoSwitch = async (role) => {
    await loginAsDemo(role);
    setShowRoleDropdown(false);
    setMobileMenuOpen(false);
    if (role === 'student') setCurrentTab('student-dashboard');
    else if (role === 'owner') setCurrentTab('owner-dashboard');
    else if (role === 'admin') setCurrentTab('admin-dashboard');
    else setCurrentTab('home');
  };

  const navLinks = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'search', label: 'Browse PGs', icon: Search },
    { key: 'roommates', label: 'Roommates', icon: UserRoundSearch },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'community', label: 'Community', icon: Users },
    { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  ];

  return (
    <>
      {/* Fullscreen College Selector Modal Overlay */}
      {showCollegeChange && (
        <CollegeSelectScreen onComplete={() => setShowCollegeChange(false)} />
      )}

      {/* Main Glass Header */}
      <header className="sticky top-0 z-40 w-full glass-panel shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div 
              onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white font-sans">
                    StaySmart
                  </span>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold -mt-1">
                  Smart Student Housing
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentTab(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentTab === key
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}

              {user && (
                <button
                  onClick={() => {
                    if (user.role === 'student') setCurrentTab('student-dashboard');
                    else if (user.role === 'owner') setCurrentTab('owner-dashboard');
                    else if (user.role === 'admin') setCurrentTab('admin-dashboard');
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentTab.includes('dashboard')
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
              )}
            </nav>

            {/* Right Action Items & Switches */}
            <div className="flex items-center gap-2">

              {/* Selected College Chip */}
              {selectedCollege && (
                <button
                  onClick={() => setShowCollegeChange(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all hover:scale-105 group backdrop-blur-md"
                  style={{
                    background: `${selectedCollege.color}15`,
                    borderColor: `${selectedCollege.color}40`,
                    color: selectedCollege.color
                  }}
                  title="Change College"
                >
                  <span className="text-sm">{selectedCollege.emoji}</span>
                  <span className="hidden sm:inline max-w-[80px] truncate">{selectedCollege.shortName}</span>
                  <RefreshCw className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              )}

              {/* Demo Role Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition-all text-xs font-semibold shadow-sm"
                  title="Quick Demo Role Switcher"
                >
                  {getRoleBadge(user ? user.role : 'guest')}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Demo Role Switcher
                    </div>
                    <div className="space-y-1">
                      {[
                        { role: 'guest', label: 'Guest User (Public)' },
                        { role: 'student', label: 'Verified Student' },
                        { role: 'owner', label: 'PG Owner / Landlord' },
                        { role: 'admin', label: 'Platform Admin' },
                      ].map(({ role, label }) => (
                        <button
                          key={role}
                          onClick={() => handleDemoSwitch(role)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors font-semibold ${
                            (role === 'guest' && !user) || user?.role === role
                              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{label}</span>
                          {((role === 'guest' && !user) || user?.role === role) && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist Icon for Student */}
              {user && user.role === 'student' && (
                <button
                  onClick={() => setCurrentTab('wishlist')}
                  className={`p-2 rounded-xl border transition-all ${
                    currentTab === 'wishlist'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200 dark:border-rose-900'
                      : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500'
                  }`}
                  title="View Saved Favorites"
                >
                  <Heart className={`w-4 h-4 ${currentTab === 'wishlist' ? 'fill-rose-500' : ''}`} />
                </button>
              )}

              {/* Dark / Light Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* User Login/Logout Actions */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all text-xs font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('login')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-bold"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setCurrentTab('register')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 transition-all text-xs font-bold shadow-md shadow-indigo-500/20"
                  >
                    Join Free
                  </button>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Sliding Navigation Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 space-y-3 animate-in slide-in-from-top duration-200 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setCurrentTab(key); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-left transition-all ${
                    currentTab === key
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            {user && (
              <button
                onClick={() => {
                  if (user.role === 'student') setCurrentTab('student-dashboard');
                  else if (user.role === 'owner') setCurrentTab('owner-dashboard');
                  else if (user.role === 'admin') setCurrentTab('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-900"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to My Dashboard
              </button>
            )}

            {!user && (
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { setCurrentTab('login'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-xs"
                >
                  Login
                </button>
                <button
                  onClick={() => { setCurrentTab('register'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Sticky Mobile Bottom Quick Bar for Handheld Devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around text-[10px] font-bold shadow-2xl">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-0.5 ${currentTab === 'home' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
        >
          <Home className="w-4 h-4" /> Home
        </button>

        <button
          onClick={() => setCurrentTab('search')}
          className={`flex flex-col items-center gap-0.5 ${currentTab === 'search' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
        >
          <Search className="w-4 h-4" /> PGs
        </button>

        <button
          onClick={() => setCurrentTab('community')}
          className={`flex flex-col items-center gap-0.5 ${currentTab === 'community' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
        >
          <Users className="w-4 h-4" /> Hub
        </button>

        <button
          onClick={() => setCurrentTab('roommates')}
          className={`flex flex-col items-center gap-0.5 ${currentTab === 'roommates' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
        >
          <UserRoundSearch className="w-4 h-4" /> Match
        </button>

        <button
          onClick={() => {
            if (user?.role === 'student') setCurrentTab('student-dashboard');
            else if (user?.role === 'owner') setCurrentTab('owner-dashboard');
            else if (user?.role === 'admin') setCurrentTab('admin-dashboard');
            else setCurrentTab('login');
          }}
          className={`flex flex-col items-center gap-0.5 ${currentTab.includes('dashboard') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> User
        </button>
      </div>
    </>
  );
};
