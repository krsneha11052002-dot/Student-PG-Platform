import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CollegeProvider, useCollege } from './context/CollegeContext';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PGDetailModal } from './components/PGDetailModal';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { CollegeSelectScreen } from './components/CollegeSelectScreen';
import { PGCompareDrawer } from './components/PGCompareDrawer';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CommunityPage } from './pages/CommunityPage';
import { CommunityDashboard } from './pages/CommunityDashboard';
import { MarketplacePage } from './pages/MarketplacePage';
import { RoommatesPage } from './pages/RoommatesPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { PGDetailPage } from './pages/PGDetailPage';
import { WishlistPage } from './pages/WishlistPage';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedPG, setSelectedPG] = useState(null);
  const [selectedPGId, setSelectedPGId] = useState(null);
  const { hasChosen } = useCollege();

  const handleSelectPG = (pg) => {
    setSelectedPGId(pg._id || pg.id);
    setCurrentTab('pg-detail');
  };

  // Show fullscreen college selection on onboarding
  if (!hasChosen) {
    return <CollegeSelectScreen onComplete={() => setCurrentTab('home')} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'search':
        return <SearchPage onSelectPG={handleSelectPG} />;
      case 'login':
        return <LoginPage setCurrentTab={setCurrentTab} />;
      case 'register':
        return <RegisterPage setCurrentTab={setCurrentTab} />;
      case 'student-dashboard':
        return <StudentDashboard setCurrentTab={setCurrentTab} onSelectPG={handleSelectPG} />;
      case 'owner-dashboard':
        return <OwnerDashboard onSelectPG={handleSelectPG} />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'community':
        return <CommunityPage setCurrentTab={setCurrentTab} />;
      case 'community-dashboard':
        return <CommunityDashboard />;
      case 'marketplace':
        return <MarketplacePage setCurrentTab={setCurrentTab} />;
      case 'roommates':
        return <RoommatesPage setCurrentTab={setCurrentTab} />;
      case 'reviews':
        return <ReviewsPage setCurrentTab={setCurrentTab} />;
      case 'pg-detail':
        return <PGDetailPage pgId={selectedPGId} setCurrentTab={setCurrentTab} />;
      case 'wishlist':
        return <WishlistPage setSelectedPGId={setSelectedPGId} setCurrentTab={setCurrentTab} />;
      case 'home':
      default:
        return <HomePage setCurrentTab={setCurrentTab} onSelectPG={handleSelectPG} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0a0f1e] dark:text-slate-100 font-sans transition-colors duration-300">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </main>

      <Footer setCurrentTab={setCurrentTab} />

      {/* Sticky PG comparison drawer widget */}
      <PGCompareDrawer setCurrentTab={setCurrentTab} setSelectedPGId={setSelectedPGId} />

      {/* Modal fallback */}
      {selectedPG && (
        <PGDetailModal
          pg={selectedPG}
          onClose={() => setSelectedPG(null)}
        />
      )}

      {/* Floating AI Assistant Widget */}
      <AIAssistantWidget onSelectPG={handleSelectPG} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CollegeProvider>
            <CompareProvider>
              <ToastProvider>
                <MainApp />
              </ToastProvider>
            </CompareProvider>
          </CollegeProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
