import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Filter, Eye, RefreshCw, AlertTriangle, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const ThreatIntel = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const { addToast } = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/history', {
        params: { search, type: typeFilter, risk: riskFilter }
      });
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.warn('Threat Intel history fallback.');
      setHistory([
        { id: 'scan-init-001', type: 'Intrusion', target: 'network_telemetry_batch1.csv', attackType: 'DoS', confidence: 98.4, riskLevel: 'Critical', summary: 'Denial of Service attack (SYN flood) detected in packet telemetry.', timestamp: '2026-08-18T12:00:00Z' },
        { id: 'scan-init-002', type: 'Scam NLP', target: 'SMS Message (OTP Fraud)', attackType: 'OTP Fraud', confidence: 96.2, riskLevel: 'High Risk', summary: 'Urgent OTP verification code request detected.', timestamp: '2026-08-18T10:00:00Z' },
        { id: 'scan-init-003', type: 'Phishing Email', target: 'support@security-alert-center.net', attackType: 'Phishing', confidence: 91.5, riskLevel: 'High Risk', summary: 'Brand impersonation and fake verification portal link.', timestamp: '2026-08-18T08:00:00Z' }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [typeFilter, riskFilter]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setHistory(history.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      addToast(`Record ${id} removed from Threat Intel logs.`, 'success');
    } catch (err) {
      addToast('Error deleting log record.', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('neuroshield_token');
      const response = await fetch('/api/history/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'neuroshield_threat_intelligence.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Threat Intel CSV exported successfully!', 'success');
    } catch (e) {
      addToast('Export failed.', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Threat Intelligence Audit Logs</h1>
            <span className="px-2.5 py-1 rounded-full bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30 font-mono text-xs">
              UNIFIED AUDIT TRAIL
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Searchable archive of evaluated security events, ML predictions, and forensic telemetry.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/40 hover:bg-[#00E5A8]/20 transition-all font-mono text-xs font-semibold self-start md:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export CSV Logs
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
              placeholder="Search by target, attack class, or incident summary..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
          >
            <option value="All">All Detection Engines</option>
            <option value="Intrusion">Intrusion Detection</option>
            <option value="Scam">Scam NLP</option>
            <option value="Phishing">Phishing Email</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
          >
            <option value="All">All Risk Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High Risk</option>
            <option value="Safe">Safe</option>
          </select>

          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-800 text-gray-400 font-mono text-[11px]">
              <tr>
                <th className="pb-3 font-semibold">Incident ID</th>
                <th className="pb-3 font-semibold">Engine / Vector</th>
                <th className="pb-3 font-semibold">Target / Artifact</th>
                <th className="pb-3 font-semibold">Attack Class</th>
                <th className="pb-3 font-semibold">Confidence</th>
                <th className="pb-3 font-semibold">Risk Rating</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-medium">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 font-mono text-gray-400">{item.id}</td>
                    <td className="py-3.5 text-gray-300 font-semibold">{item.type}</td>
                    <td className="py-3.5 text-gray-200 max-w-xs truncate">{item.target}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded font-mono text-[11px] bg-gray-800 text-gray-300 border border-gray-700">
                        {item.attackType}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-gray-300">{item.confidence}%</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.riskLevel.includes('Critical') || item.riskLevel.includes('High')
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No threat logs matching query parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-gray-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-white font-mono">Incident Forensic Inspector</h3>
            
            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 font-mono">
                <span className="text-gray-500 block">ID: {selectedItem.id}</span>
                <span className="text-gray-500 block">Timestamp: {new Date(selectedItem.timestamp).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                <span className="font-semibold text-white block mb-1">Target / Artifact:</span>
                <span className="text-gray-300 font-mono">{selectedItem.target}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                <span className="font-semibold text-white block mb-1">Technical Summary:</span>
                <span className="text-gray-300">{selectedItem.summary}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-300"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
