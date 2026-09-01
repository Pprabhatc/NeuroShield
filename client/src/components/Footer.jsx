import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Cpu } from 'lucide-react';

export const Footer = () => {
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
              Network Intrusion Detection System analyzing network-flow connection records using machine learning to classify normal and malicious traffic.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#00E5A8] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#00E5A8] transition-colors">SOC Control Dashboard</Link>
              </li>
              <li>
                <Link to="/intrusion" className="hover:text-[#00E5A8] transition-colors">Intrusion Detection Scanner</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#00E5A8] transition-colors">Detection History</Link>
              </li>
              <li>
                <Link to="/model-performance" className="hover:text-[#00E5A8] transition-colors">Model Performance</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#00E5A8] transition-colors">Profile & Account</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-3">IDS Architecture</h4>
            <ul className="space-y-2">
              <li>Scikit-Learn Random Forest Pipeline</li>
              <li>Network Flow Feature Preprocessing</li>
              <li>Python Flask ML Service (Port 5001)</li>
              <li>Node.js Express REST API Gateway</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-3">System Information</h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-gray-300">
                <Cpu className="w-3.5 h-3.5 text-[#00E5A8]" />
                <span>Prototype Intrusion Detection System</span>
              </div>
              <div className="text-gray-500 pt-1">
                Supports CSV network telemetry feature uploads up to 10 MB.
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <p>© 2026 NeuroShield IDS Platform. All rights reserved.</p>
          <p className="text-gray-500">AI-Powered Network Intrusion Detection</p>
        </div>

      </div>
    </footer>
  );
};
