import React, { useState } from 'react';
import { Shield, Activity, Terminal, Lock, LogIn, UserCheck, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'intrusion', label: 'Network Intrusion', icon: Terminal },
    { id: 'scam', label: 'NLP Scam Detector', icon: Shield },
    { id: 'phishing', label: 'Phishing Analyzer', icon: Lock },
    { id: 'threats', label: 'Threat Intel', icon: Activity },
    { id: 'profile', label: 'Profile', icon: UserCheck }
  ];

  return (
    <nav className="sticky top-0 z-40 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5A8] to-[#4F8CFF] p-0.5 shadow-lg shadow-[#00E5A8]/20">
              <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#00E5A8]" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-sans text-white">
                NEURO<span className="gradient-text-primary">SHIELD</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30">
                v2.4 SOC
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Bar & User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              FLASK ML ACTIVE
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-800">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#4F8CFF]/20 border border-[#4F8CFF]/40 text-[#4F8CFF] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="text-left leading-tight hidden xl:block">
                    <p className="text-xs font-semibold text-gray-200">{user.name || 'Analyst'}</p>
                    <p className="text-[10px] text-gray-400">{user.role || 'SOC Lead'}</p>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/10 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-[#00E5A8]/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In / Access SOC
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-card border-b border-gray-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
                  activeTab === link.id
                    ? 'bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {link.label}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
