import React, { useState } from 'react';
import { Shield, Lock, Mail, User, Key, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Auth = ({ onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Senior SOC Analyst');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      const res = await register(name, email, password, role);
      if (res.success) {
        addToast('Registration successful! Welcome to NeuroShield.', 'success');
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        addToast(res.message, 'error');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        addToast('Welcome back, SOC Analyst!', 'success');
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        addToast(res.message, 'error');
      }
    }
    setLoading(false);
  };

  const handleFillDemo = () => {
    setEmail('analyst@neuroshield.io');
    setPassword('admin123');
    addToast('Demo credentials autofilled!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30 mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRegister ? 'Create SOC Account' : 'SOC Analyst Login'}
          </h2>
          <p className="text-xs text-gray-400">
            {isRegister ? 'Access the NeuroShield threat intelligence platform' : 'Enter credentials to authenticate security session'}
          </p>
        </div>

        {/* Quick Demo Fill Button */}
        {!isRegister && (
          <button
            onClick={handleFillDemo}
            className="w-full mb-6 py-2 px-3 rounded-xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 text-[#4F8CFF] text-xs font-mono flex items-center justify-center gap-2 hover:bg-[#4F8CFF]/20 transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            Autofill Demo Credentials (analyst@neuroshield.io)
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-[#00E5A8] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@neuroshield.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-[#00E5A8] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-[#00E5A8] transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">SOC Role / Specialty</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-[#00E5A8] transition-colors"
              >
                <option value="Senior SOC Lead">Senior SOC Lead</option>
                <option value="Network Incident Responder">Network Incident Responder</option>
                <option value="NLP Malware Analyst">NLP Malware Analyst</option>
                <option value="Security Researcher">Security Researcher</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#00E5A8]/20 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account & Access' : 'Authenticate Session'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-medium text-gray-400 hover:text-[#00E5A8] transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in here' : "Don't have an account? Register new analyst"}
          </button>
        </div>

      </div>
    </div>
  );
};
