import React, { useState } from 'react';
import { Upload, FileText, Play, Download, AlertTriangle, CheckCircle2, Cpu, ArrowRight, RefreshCw, XCircle, LogIn, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { generateSecurityReport } from '../utils/pdfGenerator';

export const NetworkIntrusion = ({ onOpenAuth }) => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [missingCols, setMissingCols] = useState([]);
  const [result, setResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { user } = useAuth();
  const { addToast } = useToast();

  const validateAndSetFile = (selectedFile) => {
    setFileError(null);
    setApiError(null);
    setMissingCols([]);
    setResult(null);

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setFileError('Invalid file type. Please select a valid CSV (.csv) file.');
      addToast('Unsupported file format. Please upload a .csv file.', 'error');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds the 10 MB limit.');
      addToast('File too large (max 10 MB).', 'error');
      return;
    }

    if (selectedFile.size === 0) {
      setFileError('The selected CSV file is empty (0 bytes).');
      addToast('Selected file is empty.', 'error');
      return;
    }

    setFile(selectedFile);
    addToast(`File loaded: ${selectedFile.name}`, 'info');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError(null);
    setResult(null);
    setApiError(null);
    setMissingCols([]);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent =
      'duration,protocol_type,service,flag,src_bytes,dst_bytes,count,srv_count,serror_rate,rerror_rate,same_srv_rate,diff_srv_rate\n' +
      '0,tcp,private,S0,0,0,320,320,1.0,0.0,1.0,0.0\n' +
      '12,tcp,http,SF,1240,4800,4,4,0.0,0.0,1.0,0.0\n' +
      '4,udp,dns,SF,45,90,80,2,0.6,0.4,0.1,0.9\n' +
      '0,tcp,smtp,SF,850,300,1,1,0.0,0.0,1.0,0.0\n' +
      '0,tcp,http,S0,0,0,250,250,1.0,0.0,1.0,0.0\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_network_intrusion.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast('Downloaded sample network telemetry CSV!', 'success');
  };

  const handleRunSampleCSV = async () => {
    if (!user) {
      addToast('Please sign in to run an intrusion scan.', 'warning');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    setLoading(true);
    setResult(null);
    setApiError(null);
    setMissingCols([]);

    const samplePayload = [
      { duration: 0, protocol_type: 'tcp', service: 'private', flag: 'S0', src_bytes: 0, dst_bytes: 0, count: 320, srv_count: 320, serror_rate: 1.0, rerror_rate: 0.0, same_srv_rate: 1.0, diff_srv_rate: 0.0 },
      { duration: 12, protocol_type: 'tcp', service: 'http', flag: 'SF', src_bytes: 1240, dst_bytes: 4800, count: 4, srv_count: 4, serror_rate: 0.0, rerror_rate: 0.0, same_srv_rate: 1.0, diff_srv_rate: 0.0 },
      { duration: 4, protocol_type: 'udp', service: 'dns', flag: 'SF', src_bytes: 45, dst_bytes: 90, count: 80, srv_count: 2, serror_rate: 0.6, rerror_rate: 0.4, same_srv_rate: 0.1, diff_srv_rate: 0.9 }
    ];

    try {
      const res = await api.post('/intrusion/predict', samplePayload);
      if (res.data.success) {
        setResult(res.data);
        setCurrentPage(1);
        addToast('Intrusion ML Analysis Complete!', 'success');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setApiError('Please sign in to run an intrusion scan.');
        if (onOpenAuth) onOpenAuth();
      } else {
        const msg = err.response?.data?.message || err.message || 'Error running intrusion scan.';
        setApiError(msg);
        if (err.response?.data?.missing_columns) {
          setMissingCols(err.response.data.missing_columns);
        }
      }
    }
    setLoading(false);
  };

  const handleUploadSubmit = async () => {
    if (!user) {
      addToast('Please sign in to run an intrusion scan.', 'warning');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!file) {
      setFileError('Please select a valid CSV file before initiating scan.');
      return;
    }

    setLoading(true);
    setResult(null);
    setApiError(null);
    setMissingCols([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/intrusion/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setResult(res.data);
        setCurrentPage(1);
        addToast('Network Intrusion Prediction Complete!', 'success');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setApiError('Please sign in to run an intrusion scan.');
        if (onOpenAuth) onOpenAuth();
      } else {
        const msg = err.response?.data?.message || err.message || 'Error running intrusion scan.';
        setApiError(msg);
        if (err.response?.data?.missing_columns) {
          setMissingCols(err.response.data.missing_columns);
        }
      }
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateSecurityReport(result, 'Network Intrusion Detection Forensic Report');
      addToast('Downloading PDF Security Report...', 'success');
    }
  };

  // Pagination for detailed records table
  const totalPages = result ? Math.ceil((result.results?.length || 0) / itemsPerPage) : 1;
  const paginatedResults = result ? (result.results || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Intrusion Detection Scanner</h1>
          <span className="px-2.5 py-1 rounded-full bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30 font-mono text-xs">
            SCIKIT-LEARN ML
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Upload network connection telemetry CSV files to classify normal vs malicious traffic patterns.</p>
      </div>

      {/* Upload Zone & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#00E5A8]" />
              Upload Network Telemetry CSV
            </h3>

            <button
              onClick={handleDownloadSampleCSV}
              className="text-xs font-mono text-[#00E5A8] hover:underline flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample CSV
            </button>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center bg-gray-900/50 transition-all space-y-3 ${
              isDragging
                ? 'border-[#00E5A8] bg-[#00E5A8]/10'
                : fileError
                ? 'border-red-500/60 bg-red-500/5'
                : 'border-gray-700 hover:border-[#00E5A8]/60'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#00E5A8]/10 text-[#00E5A8] mx-auto flex items-center justify-center border border-[#00E5A8]/30">
              <FileText className="w-6 h-6" />
            </div>

            <div>
              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
                    {file.name}
                    <span className="text-xs font-mono text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </p>
                  <button
                    onClick={handleRemoveFile}
                    className="text-xs text-red-400 hover:text-red-300 underline font-mono"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-200">
                    Drag & drop network connection CSV file here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Supports network feature telemetry (.csv, max 10 MB)</p>
                </>
              )}
            </div>

            {!file && (
              <label className="inline-block px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-200 cursor-pointer transition-colors">
                Browse Files
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Client File Validation Error */}
          {fileError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {/* API Server Error */}
          {apiError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {apiError}</span>
                {apiError.includes('sign in') && (
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </button>
                )}
              </div>
              {missingCols.length > 0 && (
                <div className="pt-2 border-t border-red-500/20 text-[11px]">
                  <p className="font-semibold text-white mb-1">Missing Required CSV Columns:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingCols.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-800">
            <button
              onClick={handleRunSampleCSV}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card border border-gray-700 text-xs font-mono text-gray-300 hover:text-white hover:border-[#4F8CFF]/50 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-[#4F8CFF]" />
              Run Preset Sample Telemetry
            </button>

            <div className="flex items-center gap-3">
              {result && (
                <button
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-300"
                >
                  New Scan
                </button>
              )}

              <button
                onClick={handleUploadSubmit}
                disabled={loading || !file}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-[#00E5A8]/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Prediction...
                  </>
                ) : (
                  <>
                    Execute Intrusion Scan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Format Specification */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#4F8CFF]" />
            Required CSV Format Specifications
          </h3>

          <p className="text-xs text-gray-400 leading-relaxed">
            Uploaded CSV files must include the following 12 connection features:
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-300">
            {['duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes', 'count', 'srv_count', 'serror_rate', 'rerror_rate', 'same_srv_rate', 'diff_srv_rate'].map((col, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">
                <span className="text-[#00E5A8] font-bold">col:</span> {col}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400 space-y-1">
            <span className="text-white font-semibold flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-[#4F8CFF]" /> Categorical Values:</span>
            <p className="text-[11px]">protocol_type (tcp, udp, icmp), service (http, dns, private, etc.), flag (SF, S0, REJ, etc.)</p>
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
                {result.overall_risk === 'Safe' || result.overall_risk === 'Low' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  Intrusion Scan Complete
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    result.overall_risk === 'Safe' || result.overall_risk === 'Low'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {result.overall_risk.toUpperCase()} RISK
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  Analyzed {result.total_records} connection records | {result.safe_records} Normal | {result.threats_detected} Malicious Flagged
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

          {/* Records Table with Pagination */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-mono">Detailed Flow Analysis Breakdown</h4>
              <span className="text-xs font-mono text-gray-400">
                Page {currentPage} of {totalPages} ({result.results?.length || 0} Records)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-800 text-gray-400 font-mono text-[11px]">
                  <tr>
                    <th className="pb-3 font-semibold">Index</th>
                    <th className="pb-3 font-semibold">Attack Prediction</th>
                    <th className="pb-3 font-semibold">Confidence</th>
                    <th className="pb-3 font-semibold">Severity</th>
                    <th className="pb-3 font-semibold">Technical Explanation</th>
                    <th className="pb-3 font-semibold">Mitigation Playbook</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-medium">
                  {paginatedResults.map((r, idx) => (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-800 font-mono text-xs">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
