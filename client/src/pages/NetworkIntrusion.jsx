import React, { useState } from 'react';
import { Upload, FileText, Play, Download, AlertTriangle, CheckCircle2, Cpu, ArrowRight, RefreshCw, XCircle, LogIn, ChevronLeft, ChevronRight, HelpCircle, Shield, Terminal } from 'lucide-react';
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
  const [inputMode, setInputMode] = useState('csv'); // 'csv' or 'manual'
  const itemsPerPage = 10;

  // Manual CICIDS2017 Input Form State
  const [manualForm, setManualForm] = useState({
    Destination_Port: 80,
    Flow_Duration: 15000,
    Total_Fwd_Packets: 25,
    Total_Bwd_Packets: 30,
    Total_Length_of_Fwd_Packets: 1200,
    Total_Length_of_Bwd_Packets: 4500,
    Flow_Bytes_s: 380.0,
    Flow_Packets_s: 3.6,
    FIN_Flag_Count: 0,
    SYN_Flag_Count: 1,
    RST_Flag_Count: 0,
    ACK_Flag_Count: 1,
    Protocol: 'tcp'
  });

  const { user } = useAuth();
  const { addToast } = useToast();

  const validateAndSetFile = (selectedFile) => {
    setFileError(null);
    setApiError(null);
    setMissingCols([]);
    setResult(null);

    if (!selectedFile) return;

    const allowedExts = ['.csv', '.pdf', '.txt', '.log', '.json', '.doc', '.docx'];
    const fileName = selectedFile.name.toLowerCase();
    const isAllowed = allowedExts.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
      setFileError('Invalid file format. Accepted formats: PDF (.pdf), TXT (.txt), LOG (.log), CSV (.csv), JSON (.json), DOCX (.docx).');
      addToast('Unsupported file format. Please upload PDF, TXT, LOG, CSV, or DOCX.', 'error');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds the 10 MB limit.');
      addToast('File too large (max 10 MB).', 'error');
      return;
    }

    if (selectedFile.size === 0) {
      setFileError('The selected file is empty (0 bytes).');
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

  const handleDownloadSampleCICIDSCSV = () => {
    const csvContent =
      'Destination_Port,Flow_Duration,Total_Fwd_Packets,Total_Bwd_Packets,Total_Length_of_Fwd_Packets,Total_Length_of_Bwd_Packets,Flow_Bytes_s,Flow_Packets_s,FIN_Flag_Count,SYN_Flag_Count,RST_Flag_Count,ACK_Flag_Count,Protocol\n' +
      '8080,19751,22,8,924,4375,268.29,1.52,0,1,0,1,tcp\n' +
      '80,15785,22,3,1269,4617,372.89,1.58,1,1,0,1,tcp\n' +
      '4444,29769,41,68,45658,104478,5043.37,3.66,0,1,0,1,tcp\n' +
      '80,6844,16,20,1242,4465,833.87,5.26,0,1,0,1,tcp\n' +
      '3389,19502,67,181,13792,15555,1504.82,12.72,1,1,1,1,tcp\n' +
      '443,876,864,1,798531,91,911668.95,987.44,0,1,0,0,tcp\n' +
      '5555,15675,53,93,52606,147791,12784.5,9.31,0,1,0,1,tcp\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_cicids2017_telemetry.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast('Downloaded sample CICIDS2017 telemetry CSV!', 'success');
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setApiError(null);
    setMissingCols([]);
    setResult(null);

    try {
      let response;

      if (inputMode === 'csv') {
        if (!file) {
          setFileError('Please select or drag a valid CSV file before running analysis.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);

        response = await api.post('/intrusion/predict', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Manual form submission
        response = await api.post('/intrusion/predict', [manualForm]);
      }

      if (response.data && response.data.success) {
        setResult(response.data);
        setCurrentPage(1);
        addToast('CICIDS2017 Intrusion detection scan completed!', 'success');
      } else {
        setApiError(response.data?.message || 'Intrusion scan returned no results.');
      }
    } catch (err) {
      if (err.response?.data?.missing_columns) {
        setMissingCols(err.response.data.missing_columns);
      }
      const msg = err.response?.data?.message || err.message || 'Error executing intrusion analysis scan.';
      setApiError(msg);
      addToast(`Analysis error: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!result) return;
    try {
      generateSecurityReport(result, file ? file.name : 'CICIDS2017_Manual_Payload.csv');
      addToast('Downloaded PDF Security Forensic Report!', 'success');
    } catch (err) {
      addToast('Failed to generate PDF report: ' + err.message, 'error');
    }
  };

  // Pagination for detailed results
  const totalPages = result?.detailed_results ? Math.ceil(result.detailed_results.length / itemsPerPage) : 1;
  const currentRecords = result?.detailed_results
    ? result.detailed_results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/30 text-xs font-mono text-[#00E5A8] mb-2">
            <Cpu className="w-3.5 h-3.5" /> CICIDS2017 ML TELEMETRY ENGINE
          </div>
          <h1 className="text-3xl font-extrabold text-white">Network Intrusion Detection</h1>
          <p className="text-gray-400 text-sm mt-1">
            Ingest CICIDS2017 packet flow telemetry to classify DoS/DDoS, Botnet, PortScan, and Infiltration attacks with 0–100 risk scoring.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center gap-2 bg-[#111827] p-1.5 rounded-xl border border-gray-800">
          <button
            onClick={() => setInputMode('csv')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
              inputMode === 'csv'
                ? 'bg-[#00E5A8] text-[#0B1020] shadow-[0_0_10px_rgba(0,229,168,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📁 CSV File Upload
          </button>
          <button
            onClick={() => setInputMode('manual')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
              inputMode === 'manual'
                ? 'bg-[#00E5A8] text-[#0B1020] shadow-[0_0_10px_rgba(0,229,168,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚡ Manual CICIDS Form
          </button>
        </div>
      </div>

      {/* Input Section */}
      {inputMode === 'csv' ? (
        <div className="glass-card border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#00E5A8]" />
                Upload Network Telemetry CSV
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Upload connection records matching CICIDS2017 feature columns (Destination_Port, Flow_Duration, Flow_Bytes_s, SYN/ACK Flags, etc.).
              </p>
            </div>

            <button
              onClick={handleDownloadSampleCICIDSCSV}
              className="px-3.5 py-2 rounded-lg bg-[#1A233A] border border-gray-700 hover:border-[#00E5A8] text-xs font-mono text-gray-200 hover:text-[#00E5A8] transition-all flex items-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4 text-[#00E5A8]" /> Download Sample CICIDS2017 CSV
            </button>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#00E5A8] bg-[#00E5A8]/10'
                : file
                ? 'border-emerald-500/50 bg-emerald-950/10'
                : 'border-gray-700 hover:border-gray-500 bg-[#0B1020]/50'
            }`}
          >
            <input type="file" accept=".csv,.pdf,.txt,.log,.json,.docx,.doc" onChange={handleFileChange} className="hidden" id="csv-file-input" />

            {file ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{file.name}</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">{(file.size / 1024).toFixed(1)} KB • Document / Telemetry File</div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <label htmlFor="csv-file-input" className="text-xs text-[#00E5A8] hover:underline cursor-pointer">
                    Change File
                  </label>
                  <span className="text-gray-600">•</span>
                  <button onClick={handleRemoveFile} className="text-xs text-red-400 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="csv-file-input" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-full bg-[#1A233A] text-[#00E5A8] flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-200">
                    Drop PDF (.pdf), Text (.txt), Log (.log), or CSV (.csv) file here, or <span className="text-[#00E5A8]">browse files</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-mono">Accepts PDF, TXT, LOG, CSV, DOCX up to 10 MB</div>
                </div>
              </label>
            )}
          </div>

          {/* Validation & API Errors */}
          {fileError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-400">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {apiError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
              <div className="flex items-center gap-3 text-xs font-bold text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
              {missingCols.length > 0 && (
                <div className="text-xs text-gray-300 font-mono pl-7">
                  Missing required columns: {missingCols.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Run Analysis Button */}
          <div className="flex justify-end">
            <button
              onClick={handleRunAnalysis}
              disabled={loading || !file}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#00B386] text-[#0B1020] font-bold text-sm hover:shadow-[0_0_20px_rgba(0,229,168,0.4)] disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating ML Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Execute CICIDS2017 ML Classification
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Manual CICIDS2017 Form */
        <div className="glass-card border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#00E5A8]" />
                Manual CICIDS2017 Telemetry Parameters
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter single packet connection flow parameters to test real-time intrusion scoring.
              </p>
            </div>
            {/* Presets */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setManualForm({
                    Destination_Port: 80,
                    Flow_Duration: 18000,
                    Total_Fwd_Packets: 25,
                    Total_Bwd_Packets: 30,
                    Total_Length_of_Fwd_Packets: 1200,
                    Total_Length_of_Bwd_Packets: 4500,
                    Flow_Bytes_s: 380.0,
                    Flow_Packets_s: 3.6,
                    FIN_Flag_Count: 0,
                    SYN_Flag_Count: 1,
                    RST_Flag_Count: 0,
                    ACK_Flag_Count: 1,
                    Protocol: 'tcp'
                  })
                }
                className="px-2.5 py-1 rounded bg-[#1A233A] text-[11px] text-gray-300 hover:text-[#00E5A8] border border-gray-700"
              >
                Normal Preset
              </button>
              <button
                onClick={() =>
                  setManualForm({
                    Destination_Port: 80,
                    Flow_Duration: 500,
                    Total_Fwd_Packets: 850,
                    Total_Bwd_Packets: 2,
                    Total_Length_of_Fwd_Packets: 500000,
                    Total_Length_of_Bwd_Packets: 100,
                    Flow_Bytes_s: 100000.0,
                    Flow_Packets_s: 1700.0,
                    FIN_Flag_Count: 0,
                    SYN_Flag_Count: 1,
                    RST_Flag_Count: 0,
                    ACK_Flag_Count: 0,
                    Protocol: 'tcp'
                  })
                }
                className="px-2.5 py-1 rounded bg-red-950/40 text-[11px] text-red-300 hover:text-red-200 border border-red-800/50"
              >
                DoS Flood Preset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Destination Port</label>
              <input
                type="number"
                value={manualForm.Destination_Port}
                onChange={(e) => setManualForm({ ...manualForm, Destination_Port: parseInt(e.target.value) || 80 })}
                className="w-full rounded-xl bg-[#0B1020] border border-gray-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Flow Duration (ms)</label>
              <input
                type="number"
                value={manualForm.Flow_Duration}
                onChange={(e) => setManualForm({ ...manualForm, Flow_Duration: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-[#0B1020] border border-gray-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Total Fwd Packets</label>
              <input
                type="number"
                value={manualForm.Total_Fwd_Packets}
                onChange={(e) => setManualForm({ ...manualForm, Total_Fwd_Packets: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-[#0B1020] border border-gray-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Total Bwd Packets</label>
              <input
                type="number"
                value={manualForm.Total_Bwd_Packets}
                onChange={(e) => setManualForm({ ...manualForm, Total_Bwd_Packets: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-[#0B1020] border border-gray-700 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Fwd Bytes Length</label>
              <input
                type="number"
                value={manualForm.Total_Length_of_Fwd_Packets}
                onChange={(e) => setManualForm({ ...manualForm, Total_Length_of_Fwd_Packets: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-[#0B1020] border border-gray-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Bwd Bytes Length</label>
              <input
                type="number"
                value={manualForm.Total_Length_of_Bwd_Packets}
                onChange={(e) => setManualForm({ ...manualForm, Total_Length_of_Bwd_Packets: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl bg-[#0B1020] border border-gray-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Flow Bytes / sec</label>
              <input
                type="number"
                value={manualForm.Flow_Bytes_s}
                onChange={(e) => setManualForm({ ...manualForm, Flow_Bytes_s: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl bg-[#0B1020] border border-gray-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Protocol</label>
              <select
                value={manualForm.Protocol}
                onChange={(e) => setManualForm({ ...manualForm, Protocol: e.target.value })}
                className="w-full rounded-xl bg-[#0B1020] border border-gray-700 px-3 py-2 text-xs text-white"
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="icmp">ICMP</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#00B386] text-[#0B1020] font-bold text-sm hover:shadow-[0_0_20px_rgba(0,229,168,0.4)] transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Analyze Payload
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-8">
          {/* Real-time Threat Alert Banner */}
          {result.is_alert && (
            <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-red-400 font-mono">REAL-TIME THREAT ALERT TRIGGERED</div>
                  <div className="text-xs text-red-200 mt-0.5">
                    Critical threat detected in telemetry payload. Overall Risk Score: <strong>{result.overall_risk_score} / 100</strong>.
                  </div>
                </div>
              </div>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all flex items-center gap-2 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF Report
              </button>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
              <div className="text-xs font-mono text-gray-400">ANALYZED RECORDS</div>
              <div className="text-2xl font-black text-white">{result.total_analyzed || 0}</div>
              <div className="text-[10px] text-[#00E5A8] font-mono">Schema: {result.dataset_schema || 'CICIDS2017'}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
              <div className="text-xs font-mono text-gray-400">MALICIOUS THREATS</div>
              <div className="text-2xl font-black text-red-400">{result.threat_count || 0}</div>
              <div className="text-[10px] text-gray-400 font-mono">{result.clean_count || 0} Legitimate Clean</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
              <div className="text-xs font-mono text-gray-400 font-bold">OVERALL RISK SCORE</div>
              <div
                className={`text-2xl font-black font-mono ${
                  result.overall_risk_score > 70
                    ? 'text-red-400'
                    : result.overall_risk_score > 40
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                {result.overall_risk_score || 10} / 100
              </div>
              <div className="text-[10px] text-gray-400 font-mono">
                {result.is_alert ? '🚨 Critical Alert Level' : '🟢 Safe / Low Risk'}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
              <div className="text-xs font-mono text-gray-400">AVG CONFIDENCE</div>
              <div className="text-2xl font-black text-[#00E5A8]">{result.avg_confidence || 98.5}%</div>
              <div className="text-[10px] text-gray-400 font-mono">Scikit-Learn Random Forest</div>
            </div>
          </div>

          {/* Detailed Records Table */}
          <div className="glass-card border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-mono">Analyzed Telemetry Records</h3>
              <div className="text-xs text-gray-400 font-mono">
                Showing page {currentPage} of {totalPages}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-[11px] font-mono text-gray-400">
                    <th className="py-3 px-3">RECORD #</th>
                    <th className="py-3 px-3">ATTACK CLASSIFICATION</th>
                    <th className="py-3 px-3">RISK SCORE</th>
                    <th className="py-3 px-3">CONFIDENCE</th>
                    <th className="py-3 px-3">EXPLANATION</th>
                    <th className="py-3 px-3">RECOMMENDED ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs">
                  {currentRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-[#1A233A]/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-gray-400">#{rec.record_index}</td>
                      <td className="py-3 px-3 font-bold text-white">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                            rec.attack_type === 'Normal'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {rec.attack_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={rec.risk_score > 60 ? 'text-red-400' : 'text-emerald-400'}>
                          {rec.risk_score || 10}/100
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#00E5A8]">{rec.confidence}%</td>
                      <td className="py-3 px-3 text-gray-300 max-w-xs truncate">{rec.explanation}</td>
                      <td className="py-3 px-3 text-gray-400 max-w-xs truncate">{rec.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded bg-[#1A233A] text-xs text-gray-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-mono text-gray-400">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded bg-[#1A233A] text-xs text-gray-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
