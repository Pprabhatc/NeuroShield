import React, { useState } from 'react';
import { Key, Lock, Copy, RefreshCw, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Profile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [apiKey, setApiKey] = useState('ns_live_94a821f08e4129b0492817a02c');
  const [copied, setCopied] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    addToast('API Key copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = 'ns_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    addToast('New API key generated successfully!', 'info');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      addToast('Please fill out all password fields.', 'warning');
      return;
    }
    addToast('Password updated successfully!', 'success');
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Analyst Profile & Security</h1>
          <span className="px-2.5 py-1 rounded-full bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30 font-mono text-xs">
            SOC AUTHENTICATED
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Manage user account metadata, API developer keys, and SOC security credentials.</p>
      </div>

      {/* User Information Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-gray-800 space-y-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00E5A8] to-[#4F8CFF] p-0.5 mx-auto shadow-xl shadow-[#00E5A8]/20">
            <div className="w-full h-full bg-[#0B1020] rounded-[14px] flex items-center justify-center font-extrabold text-2xl text-[#00E5A8]">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{user?.name || 'Cyber Threat Analyst'}</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{user?.email || 'analyst@neuroshield.io'}</p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/30 font-mono text-xs font-semibold">
              {user?.role || 'Senior SOC Lead'}
            </span>
          </div>

          <div className="pt-4 border-t border-gray-800 grid grid-cols-2 gap-4 text-left font-mono text-xs">
            <div>
              <span className="text-gray-500 block">ACCOUNT ID</span>
              <span className="text-gray-200 font-semibold">{user?.id || 'usr-9204'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">STATUS</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active
              </span>
            </div>
          </div>
        </div>

        {/* API Key Management */}
        <div className="lg:col-span-8 space-y-6">

          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#00E5A8]" />
              Developer API Key & Quotas
            </h3>

            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 space-y-3">
              <span className="text-xs font-mono text-gray-400 block">ACTIVE API KEY</span>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs font-mono text-[#00E5A8] focus:outline-none"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleRegenerateKey}
                  className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                  title="Regenerate API Key"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Monthly IDS Scan Request Quota</span>
                <span className="text-[#00E5A8]">4,280 / 10,000</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] w-[42%]" />
              </div>
            </div>
          </div>

          {/* Password Update Card */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF4D6D]" />
              Update Credentials
            </h3>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-200 hover:text-white transition-colors"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
