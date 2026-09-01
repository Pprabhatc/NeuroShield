import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, AlertTriangle, CheckCircle, Search, RefreshCw, Filter, Cpu, ArrowUpRight, ShieldAlert, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const Dashboard = ({ onOpenAuth }) => {
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/analytics');
      if (res.data.success) {
        setMetrics(res.data.metrics);
        setCharts(res.data.charts);
        setRecentScans(res.data.recentScans || []);
      }
    } catch (err) {
      console.warn('Dashboard telemetry fetch failed:', err);
      setError('Dashboard data is unavailable. Please start the backend service and try again.');
      setMetrics(null);
      setCharts(null);
      setRecentScans([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#00E5A8', '#FF4D6D', '#F59E0B', '#4F8CFF', '#A855F7', '#EC4899'];

  const filteredScans = recentScans.filter((s) => {
    const fn = s.filename || s.target || '';
    const mainAtk = s.mainAttackCategory || s.attackType || '';
    const matchesSearch =
      fn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mainAtk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const risk = s.overallRisk || s.riskLevel || '';
    const matchesRisk = riskFilter === 'All' || risk.toLowerCase().includes(riskFilter.toLowerCase());
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-8 pb-16">

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">SOC Control Center</h1>
            <span className="px-2.5 py-1 rounded-full bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30 font-mono text-xs">
              IDS TELEMETRY
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Real-time network intrusion telemetry and Machine Learning flow analytics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchAnalytics();
              addToast('Telemetry refreshed!', 'info');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card border border-gray-800 text-xs font-mono text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>

          <button
            onClick={() => navigate('/intrusion')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-xs shadow-md shadow-[#00E5A8]/20 hover:opacity-90 transition-opacity"
          >
            + New Intrusion Scan
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card rounded-3xl p-8 border border-red-500/30 text-center space-y-4 max-w-2xl mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Dashboard Unavailable</h3>
          <p className="text-xs text-gray-300">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-white transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 border border-gray-800 animate-pulse h-28" />
          ))}
        </div>
      )}

      {/* Content View when loaded */}
      {!loading && !error && metrics && (
        <>
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-gray-800 hover:border-[#4F8CFF]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 font-mono">TOTAL SCANS</span>
                <div className="p-2 rounded-xl bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white font-mono">{metrics.totalScans}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Executed CSV scans</p>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-gray-800 hover:border-[#00E5A8]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 font-mono">TOTAL FLOWS</span>
                <div className="p-2 rounded-xl bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/20">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white font-mono">{metrics.totalNetworkFlows}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Analyzed connection records</p>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-gray-800 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 font-mono">NORMAL FLOWS</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">{metrics.normalFlows}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Clean baseline traffic</p>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-gray-800 hover:border-[#FF4D6D]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 font-mono">MALICIOUS FLOWS</span>
                <div className="p-2 rounded-xl bg-[#FF4D6D]/10 text-[#FF4D6D] border border-[#FF4D6D]/20">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-[#FF4D6D] font-mono">{metrics.maliciousFlows}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Flagged intrusion threats</p>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-gray-800 hover:border-[#F59E0B]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 font-mono">HIGH/CRITICAL ALERTS</span>
                <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-[#F59E0B] font-mono">{metrics.highCriticalAlerts}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">High severity scan events</p>
            </div>

          </div>

          {/* Empty state when 0 scans exist */}
          {metrics.totalScans === 0 && (
            <div className="glass-card rounded-3xl p-10 border border-gray-800 text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-[#00E5A8] mx-auto opacity-80" />
              <h3 className="text-xl font-bold text-white">No Intrusion Scans Executed Yet</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Upload network telemetry CSV files on the Intrusion Detection page to start generating live threat telemetry.
              </p>
              <button
                onClick={() => navigate('/intrusion')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-xs shadow-md"
              >
                Launch First Scan
              </button>
            </div>
          )}

          {/* Charts Section */}
          {metrics.totalScans > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Detection Trend Timeline */}
              <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Detection Trend Timeline</h3>
                    <p className="text-xs text-gray-400">Threat vs Safe telemetry records grouped by scan date</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">HISTORICAL DATES</span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts?.detectionTrend || []}>
                      <defs>
                        <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00E5A8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={11} />
                      <YAxis stroke="#6B7280" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="threats" stroke="#FF4D6D" fillOpacity={1} fill="url(#colorThreats)" name="Malicious Flows" />
                      <Area type="monotone" dataKey="safe" stroke="#00E5A8" fillOpacity={1} fill="url(#colorSafe)" name="Normal Flows" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attack Category Distribution Pie Chart */}
              <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Attack Distribution</h3>
                  <p className="text-xs text-gray-400">Categorized by evaluated exploit class</p>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  {charts?.attackDistribution && charts.attackDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.attackDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {charts.attackDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                        <Legend formatter={(val) => <span className="text-xs text-gray-300 font-medium">{val}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-gray-500">No attack distribution data yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Risk Level Distribution & Recent Security Telemetry Table */}
          {metrics.totalScans > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Risk Severity Breakdown</h3>
                  <p className="text-xs text-gray-400">Evaluated scan risk ratings</p>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts?.riskDistribution || []}>
                      <XAxis dataKey="risk" stroke="#6B7280" fontSize={11} />
                      <YAxis stroke="#6B7280" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                      <Bar dataKey="count" fill="#4F8CFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-gray-800 space-y-4">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Recent Security Scans</h3>
                    <p className="text-xs text-gray-400">Latest network intrusion analysis history</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search filename..."
                        className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
                      />
                    </div>

                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
                    >
                      <option value="All">All Severities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low / Safe</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-800 text-gray-400 font-mono text-[11px]">
                      <tr>
                        <th className="pb-3 font-semibold">Filename / Input</th>
                        <th className="pb-3 font-semibold">Records</th>
                        <th className="pb-3 font-semibold">Main Attack Category</th>
                        <th className="pb-3 font-semibold">Overall Risk</th>
                        <th className="pb-3 font-semibold">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 font-medium">
                      {filteredScans.length > 0 ? (
                        filteredScans.map((s, idx) => (
                          <tr key={idx} className="hover:bg-gray-800/40 transition-colors">
                            <td className="py-3">
                              <p className="font-semibold text-gray-200">{s.filename || s.target || 'CSV Payload'}</p>
                              <p className="text-[10px] text-gray-500 font-mono">ID: {s.id}</p>
                            </td>
                            <td className="py-3 font-mono text-gray-300">
                              {s.totalRecords || 1}
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-800 text-gray-300 border border-gray-700">
                                {s.mainAttackCategory || s.attackType || 'Normal'}
                              </span>
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${(s.overallRisk || s.riskLevel || '').includes('Critical') || (s.overallRisk || s.riskLevel || '').includes('High')
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}
                              >
                                {s.overallRisk || s.riskLevel || 'Low'}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-gray-500 text-[10px]">
                              {new Date(s.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-gray-500">
                            No matching intrusion scan records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};
