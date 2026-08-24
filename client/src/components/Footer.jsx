import React from 'react';
import { Shield, GitBranch, Cpu, Terminal } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="border-t border-gray-800/80 bg-[#0B1020]/90 text-gray-400 text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00E5A8] to-[#4F8CFF] p-0.5">
                <div className="w-full h-full bg-[#0B1020] rounded-[6px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#00E5A8]" />
                </div>
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">NEUROSHIELD IDS</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enterprise SOC security platform combining Network Intrusion ML (Scikit-Learn) and NLP Scam & Phishing Detection.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('intrusion')} className="hover:text-[#00E5A8] transition-colors">
                  Network Intrusion Detection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('scam')} className="hover:text-[#00E5A8] transition-colors">
                  NLP Scam & Fraud Detector
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('phishing')} className="hover:text-[#00E5A8] transition-colors">
                  Phishing Email Analyzer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('threats')} className="hover:text-[#00E5A8] transition-colors">
                  Threat Intelligence Audit Logs
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-3">AI & ML Architecture</h4>
            <ul className="space-y-2">
              <li>Scikit-Learn Random Forest Pipeline</li>
              <li>TF-IDF Vectorizer + Logistic Regression</li>
              <li>Python Flask Microservice (Port 5001)</li>
              <li>Node.js Express REST API Gateway</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-3">System Status</h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FLASK ML SERVICE: ONLINE</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>EXPRESS GATEWAY: ONLINE</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 pt-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Version 2.4.0 (Build 2026.08)</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <p>© 2026 NeuroShield IDS Platform. All rights reserved.</p>
          <p className="text-gray-500">CrowdStrike / Defender Inspired SaaS Architecture</p>
        </div>

      </div>
    </footer>
  );
};
