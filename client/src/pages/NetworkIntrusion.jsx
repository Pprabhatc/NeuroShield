import React, { useState } from 'react';
import { Upload, FileText, Play, Download, AlertTriangle, ShieldCheck, Cpu, CheckCircle2, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { generateSecurityReport } from '../utils/pdfGenerator';

export const NetworkIntrusion = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleRunSampleCSV = async () => {
    setLoading(true);
    setResult(null);
    addToast('Executing sample NSL-KDD telemetry dataset scan...', 'info');

    // Sample payload representing DoS SYN-flood & Probe connection records
    const samplePayload = [
      { duration: 0, protocol_type: 'tcp', service: 'private', flag: 'S0', src_bytes: 0, dst_bytes: 0, count: 320, srv_count: 320, serror_rate: 1.0, rerror_rate: 0.0, same_srv_rate: 1.0, diff_srv_rate: 0.0 },
      { duration: 12, protocol_type: 'tcp', service: 'http', flag: 'SF', src_bytes: 1240, dst_bytes: 4800, count: 4, srv_count: 4, serror_rate: 0.0, rerror_rate: 0.0, same_srv_rate: 1.0, diff_srv_rate: 0.0 },
      { duration: 4, protocol_type: 'udp', service: 'dns', flag: 'SF', src_bytes: 45, dst_bytes: 90, count: 80, srv_count: 2, serror_rate: 0.6, rerror_rate: 0.4, same_srv_rate: 0.1, diff_srv_rate: 0.9 }
    ];

    try {
      const res = await api.post('/intrusion/predict', samplePayload);
      if (res.data.success) {
        setResult(res.data);
        addToast('Intrusion ML Analysis Complete!', 'success');
      }
    } catch (err) {
      addToast('Failed to process sample scan: ' + (err.response?.data?.message || err.message), 'error');
    }
    setLoading(false);
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      addToast('Please select a CSV file first.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);
    addToast('Uploading CSV to Flask ML microservice...', 'info');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/intrusion/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setResult(res.data);
        addToast('Network Intrusion Prediction Complete!', 'success');
      }
    } catch (err) {
      addToast('Error running intrusion scan: ' + (err.response?.data?.message || err.message), 'error');
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateSecurityReport(result, 'Network Intrusion Detection Forensic Report');
      addToast('Downloading PDF Security Report...', 'success');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Network Intrusion Detection</h1>
          <span className="px-2.5 py-1 rounded-full bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30 font-mono text-xs">
            SCIKIT-LEARN ML
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Upload network telemetry connection CSV files to classify exploits across 7 attack taxonomies.</p>
      </div>

      {/* Attack Taxonomy Badge Stream */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <span className="text-gray-400 self-center mr-2">Supported Class Taxonomy:</span>
        {['Normal', 'DoS', 'Probe', 'R2L', 'U2R', 'Brute Force', 'Botnet'].map((cls, i) => (
          <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">
            {cls}
          </span>
        ))}
      </div>

      {/* Upload Zone & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-gray-800 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#00E5A8]" />
            Upload Connection Telemetry CSV
          </h3>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-700 hover:border-[#00E5A8]/60 rounded-2xl p-8 text-center bg-gray-900/50 transition-all cursor-pointer space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#00E5A8]/10 text-[#00E5A8] mx-auto flex items-center justify-center border border-[#00E5A8]/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-200">
                {file ? file.name : 'Drag & drop telemetry CSV file here'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Supports standard NSL-KDD feature formatting (.csv)</p>
            </div>
            <label className="inline-block px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-200 cursor-pointer transition-colors">
              Browse Local Files
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-800">
            <button
              onClick={handleRunSampleCSV}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card border border-gray-700 text-xs font-mono text-gray-300 hover:text-white hover:border-[#4F8CFF]/50 transition-all"
            >
              <Play className="w-3.5 h-3.5 text-[#4F8CFF]" />
              Run Preset Sample Telemetry
            </button>

            <button
              onClick={handleUploadSubmit}
              disabled={loading || !file}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-[#00E5A8]/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing ML Pipeline...
                </>
              ) : (
                <>
                  Execute Scikit ML Prediction
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Guidelines Box */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#4F8CFF]" />
            ML Pipeline Specifications
          </h3>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="font-semibold text-white font-mono block">Feature Preprocessing:</span>
              <span>LabelEncoding for categorical fields (protocol_type, service, flag) + StandardScaler feature scaling.</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="font-semibold text-white font-mono block">Classifier Algorithm:</span>
              <span>RandomForestClassifier (100 estimators, max depth 12) with multi-class probability scoring.</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="font-semibold text-white font-mono block">Response Time:</span>
              <span>Inference executes in ~12ms via Flask microservice endpoint.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 pt-4">
          
          {/* Summary Banner */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold text-lg ${
                result.overall_risk === 'Safe' || result.overall_risk === 'Low'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {result.overall_risk === 'Safe' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Intrusion Scan Complete — {result.overall_risk.toUpperCase()} RISK
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Analyzed {result.total_records} connection records. {result.threats_detected} malicious flows flagged.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/40 hover:bg-[#00E5A8]/20 transition-all font-mono text-xs font-semibold"
            >
              <Download className="w-4 h-4" />
              Download PDF Security Report
            </button>
          </div>

          {/* Records Table */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono">Detailed Telemetry Breakdown</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-800 text-gray-400 font-mono text-[11px]">
                  <tr>
                    <th className="pb-3 font-semibold">Flow Index</th>
                    <th className="pb-3 font-semibold">Attack Prediction</th>
                    <th className="pb-3 font-semibold">Confidence %</th>
                    <th className="pb-3 font-semibold">Risk Severity</th>
                    <th className="pb-3 font-semibold">AI Technical Explanation</th>
                    <th className="pb-3 font-semibold">Mitigation Playbook</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-medium">
                  {result.results.map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 font-mono text-gray-400">#{r.record_index}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${
                          r.attack_type === 'Normal'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {r.attack_type}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-gray-200">{r.confidence}%</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          r.risk_level === 'Critical' || r.risk_level === 'High'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {r.risk_level}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-300 max-w-xs text-[11px] leading-relaxed">{r.explanation}</td>
                      <td className="py-3.5 text-gray-400 max-w-xs text-[11px] font-mono leading-relaxed">{r.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
