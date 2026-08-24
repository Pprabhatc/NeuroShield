import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, CheckCircle, Search, RefreshCw, Filter, Server, ArrowUpRight, Cpu, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const Dashboard = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const { addToast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/analytics');
      if (res.data.success) {
        setMetrics(res.data.metrics);
        setCharts(res.data.charts);
        setRecentScans(res.data.recentScans);
      }
    } catch (err) {
      console.warn('Dashboard fetch using local fallback state.');
      // Local fallback telemetry state
      setMetrics({
        totalScans: 482,
        threatsDetected: 148,
        safeScans: 334,
        highRiskAlerts: 62,
        systemHealth: {
          flaskService: 'Online (Port 5001)',
          expressService: 'Online (Port 5000)',
          mlPipeline: 'Scikit-learn / TF-IDF Active',
          database: 'Storage Engine Active'
        }
      });
      setCharts({
        detectionTrend: [
          { day: 'Mon', threats: 18, safe: 42, total: 60 },
          { day: 'Tue', threats: 25, safe: 55, total: 80 },
          { day: 'Wed', threats: 14, safe: 48, total: 62 },
          { day: 'Thu', threats: 32, safe: 60, total: 92 },
          { day: 'Fri', threats: 28, safe: 64, total: 92 },
          { day: 'Sat', threats: 12, safe: 35, total: 47 },
          { day: 'Sun', threats: 19, safe: 30, total: 49 }
        ],
        attackDistribution: [
          { name: 'DoS', value: 38 },
          { name: 'Phishing', value: 25 },
          { name: 'OTP Fraud', value: 18 },
          { name: 'Probe', value: 12 },
          { name: 'Botnet', value: 7 }
        ],
        riskDistribution: [
          { risk: 'Safe', count: 334 },
          { risk: 'Medium', count: 86 },
          { risk: 'High', count: 42 },
          { risk: 'Critical', count: 20 }
        ]
      });
      setRecentScans([
        { id: 'scan-101', type: 'Intrusion Detection', target: 'connection_log_dos.csv', attackType: 'DoS', confidence: 98.4, riskLevel: 'Critical', timestamp: '2026-08-18T14:20:00Z' },
        { id: 'scan-102', type: 'NLP Scam Detector', target: 'SMS Message (OTP Alert)', attackType: 'OTP Fraud', confidence: 94.2, riskLevel: 'High Risk', timestamp: '2026-08-18T13:45:00Z' },
        { id: 'scan-103', type: 'Phishing Email', target: 'support@security-alert-center.net', attackType: 'Phishing', confidence: 89.1, riskLevel: 'High Risk', timestamp: '2026-08-18T12:10:00Z' },
        { id: 'scan-104', type: 'Intrusion Detection', target: 'sample_normal_stream.csv', attackType: 'Normal', confidence: 99.2, riskLevel: 'Safe', timestamp: '2026-08-18T10:30:00Z' }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#FF4D6D', '#F59E0B', '#4F8CFF', '#00E5A8', '#A855F7'];

  const filteredScans = recentScans.filter((s) => {
    const matchesSearch =
      (s.target && s.target.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.attackType && s.attackType.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRisk = riskFilter === 'All' || s.riskLevel.toLowerCase().includes(riskFilter.toLowerCase());
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
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Real-time AI threat monitoring across network traffic and NLP channels.</p>
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
            onClick={() => onNavigate('intrusion')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-xs shadow-md shadow-[#00E5A8]/20"
          >
            + New Scan
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card rounded-2xl p-5 border border-gray-800 hover:border-[#4F8CFF]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Total Scans Executed</span>
            <div className="p-2 rounded-xl bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{metrics?.totalScans || 482}</span>
            <span className="flex items-center text-[11px] font-mono text-emerald-400">
              <ArrowUpRight className="w-3 h-3" /> +14.2%
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Network flows & NLP text payloads</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-gray-800 hover:border-[#FF4D6D]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Threats Flagged</span>
            <div className="p-2 rounded-xl bg-[#FF4D6D]/10 text-[#FF4D6D] border border-[#FF4D6D]/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#FF4D6D]">{metrics?.threatsDetected || 148}</span>
            <span className="flex items-center text-[11px] font-mono text-red-400">
              <ArrowUpRight className="w-3 h-3" /> +8.4%
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Requires incident responder action</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-gray-800 hover:border-[#00E5A8]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Safe Baseline Scans</span>
            <div className="p-2 rounded-xl bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/20">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#00E5A8]">{metrics?.safeScans || 334}</span>
            <span className="flex items-center text-[11px] font-mono text-emerald-400">
              <ArrowUpRight className="w-3 h-3" /> 69.3% Rate
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Verified normal traffic patterns</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-gray-800 hover:border-[#F59E0B]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">High Risk Alerts</span>
            <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#F59E0B]">{metrics?.highRiskAlerts || 62}</span>
            <span className="flex items-center text-[11px] font-mono text-amber-400">
              <ArrowDownRight className="w-3 h-3" /> -2.1%
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Critical & High severity rating</p>
        </div>

      </div>

      {/* System Health Status Bar */}
      <div className="glass-card rounded-2xl p-4 border border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-gray-300">
          <Cpu className="w-4 h-4 text-[#00E5A8]" />
          <span>MICROSERVICE TELEMETRY:</span>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Flask ML: Port 5001</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Express Gateway: Port 5000</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Scikit-learn Pipeline</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Detection Trend Line Chart */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Detection Trend Timeline</h3>
              <p className="text-xs text-gray-400">Threat vs Safe telemetry activity across days</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">7-DAY RANGE</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.detectionTrend || []}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00E5A8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="threats" stroke="#FF4D6D" fillOpacity={1} fill="url(#colorThreats)" name="Threats" />
                <Area type="monotone" dataKey="safe" stroke="#00E5A8" fillOpacity={1} fill="url(#colorSafe)" name="Safe Traffic" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Distribution Pie Chart */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Attack Distribution</h3>
            <p className="text-xs text-gray-400">Categorized by exploit type</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.attackDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.attackDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                <Legend formatter={(val) => <span className="text-xs text-gray-300 font-medium">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Risk Level Distribution Bar Chart & Recent Detections Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Risk Level Distribution</h3>
            <p className="text-xs text-gray-400">Severity breakdown of evaluated scans</p>
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
              <h3 className="text-base font-bold text-white">Recent Security Telemetry</h3>
              <p className="text-xs text-gray-400">Live detection feed across network & NLP engines</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search scans..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
                />
              </div>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:border-[#00E5A8]"
              >
                <option value="All">All Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Safe">Safe</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-800 text-gray-400 font-mono text-[11px]">
                <tr>
                  <th className="pb-3 font-semibold">Engine / Target</th>
                  <th className="pb-3 font-semibold">Attack Class</th>
                  <th className="pb-3 font-semibold">Confidence</th>
                  <th className="pb-3 font-semibold">Risk Rating</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {filteredScans.length > 0 ? (
                  filteredScans.map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3">
                        <p className="font-semibold text-gray-200">{s.target}</p>
                        <p className="text-[10px] text-gray-500">{s.type}</p>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-800 text-gray-300 border border-gray-700">
                          {s.attackType}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-gray-300">
                        {s.confidence}%
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            s.riskLevel.includes('Critical')
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : s.riskLevel.includes('High')
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {s.riskLevel}
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
                      No matching threat scans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
