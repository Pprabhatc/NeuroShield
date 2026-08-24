import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { NetworkIntrusion } from './pages/NetworkIntrusion';
import { ScamDetector } from './pages/ScamDetector';
import { PhishingAnalyzer } from './pages/PhishingAnalyzer';
import { ThreatIntel } from './pages/ThreatIntel';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';

export const App = () => {
  const [activeTab, setActiveTab] = useState('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onLaunchScanner={setActiveTab} onOpenAuth={() => setAuthModalOpen(true)} />;
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'intrusion':
        return <NetworkIntrusion />;
      case 'scam':
        return <ScamDetector />;
      case 'phishing':
        return <PhishingAnalyzer />;
      case 'threats':
        return <ThreatIntel />;
      case 'profile':
        return <Profile />;
      default:
        return <LandingPage onLaunchScanner={setActiveTab} onOpenAuth={() => setAuthModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-gray-100 font-sans selection:bg-[#00E5A8]/30 selection:text-[#00E5A8]">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {renderActivePage()}
      </main>

      {/* Auth Modal Overlay */}
      {authModalOpen && (
        <Auth
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setActiveTab('dashboard')}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />
    </div>
  );
};

export default App;
