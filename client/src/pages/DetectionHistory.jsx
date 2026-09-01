import React, { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, Trash2, Eye, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const DetectionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [attackFilter, setAttackFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const { addToast } = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/history', {
        params: { search, attackClass: attackFilter, risk: riskFilter }
      });
      if (res.data.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.warn('Error fetching detection history:', err);
      setError(err.response?.data?.message || 'Failed to load detection history. Please check server connectivity.');
      setHistory([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [attackFilter, riskFilter]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setHistory(history.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      addToast(`Scan log ${id} deleted successfully.`, 'success');
    } catch (err) {
      addToast('Error deleting log record: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('neuroshield_token');
      const response = await fetch('/api/history/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error('Export request failed.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'neuroshield_ids_detection_history.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Detection history exported to CSV successfully!', 'success');
    } catch (e) {
      addToast('Export failed: ' + e.message, 'error');
    }
  };

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Detection History</h1>
            <span className="px-2.5 py-1 rounded-full bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30 font-mono text-xs">
              IDS AUDIT TRAIL
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Searchable log archive of historical network intrusion telemetry scans.</p>
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
              placeholder="Search by filename, attack category, or scan ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={attackFilter}
            onChange={(e) => setAttackFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
          >
            <option value="All">All Attack Categories</option>
            <option value="Normal">Normal Traffic</option>
            <option value="DoS">Denial of Service (DoS)</option>
            <option value="Probe">Recon / Probe</option>
            <option value="Botnet">Botnet</option>
            <option value="R2L">Remote-to-Local (R2L)</option>
            <option value="U2R">User-to-Root (U2R)</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
          >
            <option value="All">All Risk Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low / Safe</option>
          </select>

          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Refresh History"
            aria-label="Refresh detection history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchHistory} className="underline hover:text-white">Retry</button>
        </div>
      )}

      {/* Main Table */}
      <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-800 text-gray-400 font-mono text-[11px]">
              <tr>
                <th className="pb-3 font-semibold">Scan ID</th>
                <th className="pb-3 font-semibold">Filename / Source</th>
                <th className="pb-3 font-semibold">Flow Records</th>
                <th className="pb-3 font-semibold">Malicious Flows</th>
                <th className="pb-3 font-semibold">Main Attack Category</th>
                <th className="pb-3 font-semibold">Overall Risk</th>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-medium">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 font-mono text-gray-400">{item.id}</td>
                    <td className="py-3.5 text-gray-200 font-semibold max-w-xs truncate">{item.filename || item.target || 'CSV Stream'}</td>
                    <td className="py-3.5 font-mono text-gray-300">{item.totalRecords || 1}</td>
                    <td className="py-3.5 font-mono text-red-400">{item.maliciousRecords || 0}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded font-mono text-[11px] bg-gray-800 text-gray-300 border border-gray-700">
                        {item.mainAttackCategory || item.attackType || 'Normal'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        (item.overallRisk || item.riskLevel || '').includes('Critical') || (item.overallRisk || item.riskLevel || '').includes('High')
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.overallRisk || item.riskLevel || 'Low'}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-gray-500 text-[10px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                        title="View Details"
                        aria-label="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Record"
                        aria-label="Delete scan record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 space-y-2">
                    <ShieldAlert className="w-8 h-8 text-gray-600 mx-auto" />
                    <p className="text-sm font-semibold text-gray-400">No network intrusion scan history found.</p>
                    <p className="text-xs text-gray-500">Run an intrusion scan on the Intrusion Detection page to populate audit logs.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-gray-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
              aria-label="Close dialog"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-white font-mono">Scan Telemetry Inspector</h3>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">SCAN ID:</span>
                  <span className="text-white">{selectedItem.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TIMESTAMP:</span>
                  <span className="text-gray-300">{new Date(selectedItem.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-1 font-mono">
                <span className="font-semibold text-white block">FILENAME / INPUT:</span>
                <span className="text-[#00E5A8]">{selectedItem.filename || selectedItem.target}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block text-[10px]">TOTAL RECORDS</span>
                  <span className="text-white font-bold text-base">{selectedItem.totalRecords || 1}</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block text-[10px]">MALICIOUS FLOWS</span>
                  <span className="text-red-400 font-bold text-base">{selectedItem.maliciousRecords || 0}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-1 font-mono text-xs">
                <span className="text-gray-500 block">MAIN ATTACK CATEGORY:</span>
                <span className="text-white font-semibold">{selectedItem.mainAttackCategory || selectedItem.attackType || 'Normal'}</span>
                <span className="text-gray-500 block pt-1">OVERALL SEVERITY:</span>
                <span className={`font-bold ${
                  (selectedItem.overallRisk || selectedItem.riskLevel || '').includes('Critical') || (selectedItem.overallRisk || selectedItem.riskLevel || '').includes('High')
                    ? 'text-red-400'
                    : 'text-emerald-400'
                }`}>
                  {selectedItem.overallRisk || selectedItem.riskLevel || 'Low'}
                </span>
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
