import React, { useState } from 'react';
import { Mail, Globe, AlertTriangle, ShieldCheck, Download, RefreshCw, CheckCircle, ArrowRight, Link as LinkIcon, User } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { generateSecurityReport } from '../utils/pdfGenerator';

export const PhishingAnalyzer = () => {
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { addToast } = useToast();

  const handleFillPhishingSample = () => {
    setSubject('Action Required: Verify Corporate Account Credentials Immediately');
    setSender('support@security-alert-center.net');
    setBody('Dear Customer, We detected suspicious sign-in attempts on your email account. To prevent suspension, verify your password within 12 hours.');
    setUrl('http://corporate-sso-login-verify.com/auth');
    setResult(null);
    addToast('Phishing email sample loaded!', 'info');
  };

  const handleAnalyze = async () => {
    if (!subject && !body && !url) {
      addToast('Please provide subject, body, or URL to analyze.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/nlp/analyze-email', { subject, sender, body, url });
      if (res.data.success) {
        setResult(res.data);
        addToast('Email Phishing Analysis Complete!', 'success');
      }
    } catch (err) {
      addToast('Error analyzing email: ' + (err.response?.data?.message || err.message), 'error');
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateSecurityReport(result, 'Phishing Email Threat Analysis');
      addToast('Downloading Security Report PDF...', 'success');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Phishing Email Analyzer</h1>
          <span className="px-2.5 py-1 rounded-full bg-[#FF4D6D]/10 text-[#FF4D6D] border border-[#FF4D6D]/30 font-mono text-xs">
            DOMAIN HEURISTICS & NLP
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Analyze incoming email headers, sender domains, body copy, and embedded link URLs for credential harvesting attacks.</p>
      </div>

      <div className="flex justify-start">
        <button
          onClick={handleFillPhishingSample}
          className="px-3.5 py-1.5 rounded-xl glass-card border border-gray-800 hover:border-[#FF4D6D]/50 text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2"
        >
          <Mail className="w-3.5 h-3.5 text-[#FF4D6D]" />
          Load Suspicious Email Sample
        </button>
      </div>

      {/* Inputs Form */}
      <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono">Email Subject Line</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., URGENT: Account Password Expiring"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-[#00E5A8] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono">Sender Email Address</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g., security@alert-center.net"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-[#00E5A8] transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono">Email Body Content</label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste full email body text..."
            className="w-full p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5A8] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono">Embedded Link / Action URL</label>
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., http://corporate-login-verify.xyz/auth"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-[#00E5A8] transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D6D] to-[#F59E0B] text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-[#FF4D6D]/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Domain & Heuristics...
              </>
            ) : (
              <>
                Analyze Email Phishing Score
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="text-xs font-mono text-gray-400">COMPOSITE PHISHING THREAT SCORE</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className={`text-4xl font-extrabold font-mono ${
                    result.phishing_score > 60 ? 'text-[#FF4D6D]' : 'text-[#00E5A8]'
                  }`}>
                    {result.phishing_score} / 100
                  </span>
                  <span className="text-sm font-semibold text-gray-200">{result.threat_level}</span>
                </div>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/40 text-xs font-mono font-semibold"
              >
                <Download className="w-4 h-4" />
                Export PDF Report
              </button>
            </div>

            {/* Suspicious Indicators list */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 font-mono mb-3">SUSPICIOUS THREAT INDICATORS DETECTED</h4>
              <div className="space-y-2">
                {result.indicators.length > 0 ? (
                  result.indicators.map((ind, i) => (
                    <div key={i} className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-mono">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{ind}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                    Zero anomaly indicators found. Email payload appears clean.
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-400 font-mono mb-2">RECOMMENDED ACTION PLAYBOOK</h4>
              <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-gray-200 leading-relaxed">
                {result.recommended_action}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
