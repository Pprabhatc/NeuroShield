import React, { useState } from 'react';
import { MessageSquare, Shield, AlertTriangle, CheckCircle, Search, RefreshCw, Copy, ExternalLink, Zap, Lock, Scale, AlertOctagon, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const ScamDetector = () => {
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const { addToast } = useToast();

  const handleAnalyze = async (sampleText) => {
    const message = sampleText || textInput;
    if (!message.trim()) {
      addToast('Please enter or paste a text message to analyze.', 'error');
      return;
    }

    if (sampleText) setTextInput(sampleText);
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/nlp/scam', { text: message });
      if (response.data && response.data.success) {
        const data = response.data;
        setResult(data);
        setScanHistory((prev) => [
          {
            id: Date.now(),
            text: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            category: data.threat_category,
            riskScore: data.risk_score,
            isAlert: data.is_alert,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev.slice(0, 9)
        ]);
        addToast('Text message analysis completed!', 'success');
      } else {
        addToast('Scan failed: ' + (response.data?.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      addToast('Error analyzing text message: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const sampleMessages = [
    {
      label: '🚨 Fake Police Arrest Warrant',
      badge: 'Fake Legal Notice',
      text: 'FINAL POLICE NOTICE: Non-bailable arrest warrant issued under section 420 by Cyber Crime Branch Delhi against your IP. Pay settlement fine of Rs 25,000 immediately to avoid arrest squad visiting your home address.'
    },
    {
      label: '⚖️ Supreme Court Legal Summons',
      badge: 'Fake Court Notice',
      text: 'SUPREME COURT SUMMONS: Case No. SC-84920/2026. You are charged with illegal digital asset transfer. Pay legal fee via UPI or face immediate freezing of bank accounts.'
    },
    {
      label: '🏦 SBI Bank OTP & KYC Scam',
      badge: 'OTP Fraud',
      text: 'Do not share: Your SBI NetBanking OTP is 849204. Call support at 1-800-FAKE-NUM immediately to cancel suspicious transaction of Rs 45,000.'
    },
    {
      label: '🎣 Netflix Login Phishing Link',
      badge: 'Phishing',
      text: 'URGENT: Your Netflix account payment failed. Update details immediately at https://netflix-verify-login.sec-auth.com or account will be terminated.'
    },
    {
      label: '🎁 Mega Million Lottery Win',
      badge: 'Lottery Scam',
      text: 'CONGRATULATIONS! Your mobile number won $1,000,000 in International Mega Millions Sweepstakes! Claim now by emailing claim@megawin-corp.xyz'
    },
    {
      label: '💼 Work-From-Home Fee Scam',
      badge: 'Job Fraud',
      text: 'Work from home opportunity! Earn $500/day reviewing online products. Pay $50 registration fee to begin immediately.'
    },
    {
      label: '🟢 Real Legitimate Electricity Bill',
      badge: 'Safe Message',
      text: 'Your monthly electricity bill for August is Rs 2,340. Due date is Aug 25. Pay online at official portal https://statepower.gov.in'
    }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/30 text-xs font-mono text-[#00E5A8]">
          <MessageSquare className="w-3.5 h-3.5" /> SMS & TEXT MESSAGE SCAM DETECTOR
        </div>
        <h1 className="text-3xl font-extrabold text-white">Text Message Scam & Fraud Analyzer</h1>
        <p className="text-gray-400 text-sm">
          Paste any SMS, WhatsApp message, email, or suspicious legal notice to verify whether it is <strong>🟢 REAL / SAFE</strong> or <strong>🔴 A DANGEROUS SCAM</strong>.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="glass-card border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 bg-[#111827]/90 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
            <Search className="w-4 h-4 text-[#00E5A8]" /> PASTE SMS / WHATSAPP / TEXT MESSAGE BELOW:
          </div>
          {textInput && (
            <button
              onClick={() => { setTextInput(''); setResult(null); }}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear Text
            </button>
          )}
        </div>

        {/* Text Input Box */}
        <div className="relative">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste text message here (e.g., 'URGENT: Police warrant issued...', 'Your account is locked click link...', 'OTP code 849204...')"
            rows={5}
            className="w-full rounded-2xl bg-[#0B1020] border border-gray-700 focus:border-[#00E5A8] focus:ring-1 focus:ring-[#00E5A8] p-4 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all leading-relaxed"
          />

          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500 font-mono">
              {textInput.length} characters • NLP TF-IDF Powered
            </span>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !textInput.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#00B386] text-[#0B1020] font-extrabold text-sm hover:shadow-[0_0_20px_rgba(0,229,168,0.4)] disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Message...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" /> Detect Scam Status
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="pt-2 border-t border-gray-800/80 space-y-3">
          <div className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#00E5A8]" /> Click any sample message below to test instantly:
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleMessages.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleAnalyze(s.text)}
                className="px-3 py-1.5 rounded-xl bg-[#1A233A] border border-gray-700 hover:border-[#00E5A8] text-xs text-gray-300 hover:text-[#00E5A8] font-medium transition-all flex items-center gap-1.5"
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card rounded-3xl p-6 sm:p-8 border ${
            result.is_alert
              ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
              : 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
          } space-y-6`}
        >
          {/* Main Status Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-gray-800 pb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  result.is_alert
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                }`}
              >
                {result.is_alert ? (
                  <AlertOctagon className="w-8 h-8 animate-pulse" />
                ) : (
                  <CheckCircle className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">MESSAGE VERIFICATION RESULT</div>
                <div className="text-2xl font-black text-white flex items-center gap-3 mt-1">
                  {result.is_alert ? (
                    <span className="text-red-400">🔴 DANGEROUS SCAM / FRAUD</span>
                  ) : (
                    <span className="text-emerald-400">🟢 REAL & SAFE MESSAGE</span>
                  )}
                </div>
                <div className="text-xs text-gray-300 font-mono mt-1">
                  Classification Category: <strong>{result.threat_category}</strong>
                </div>
              </div>
            </div>

            {/* Risk Score Meter Gauge */}
            <div className="flex items-center gap-4 bg-[#0B1020] p-4 rounded-2xl border border-gray-800">
              <div className="text-right">
                <div className="text-xs text-gray-400 font-mono">RISK SCORE (0 - 100)</div>
                <div
                  className={`text-3xl font-black font-mono ${
                    result.risk_score > 70
                      ? 'text-red-400'
                      : result.risk_score > 40
                      ? 'text-yellow-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {result.risk_score} / 100
                </div>
              </div>
              <div className="w-2.5 h-12 rounded-full bg-gray-800 overflow-hidden flex flex-col justify-end">
                <div
                  className={`w-full transition-all duration-1000 ${
                    result.risk_score > 70
                      ? 'bg-red-500'
                      : result.risk_score > 40
                      ? 'bg-yellow-500'
                      : 'bg-emerald-400'
                  }`}
                  style={{ height: `${result.risk_score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Real-time Alert Banner if Scam */}
          {result.is_alert && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center gap-3 text-red-200 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>
                <strong>SCAM WARNING:</strong> This text message displays characteristics of <strong>{result.threat_category}</strong>. Do NOT pay any money, share OTP codes, or click links.
              </span>
            </div>
          )}

          {/* Indicators Breakdown */}
          {result.indicators && result.indicators.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-gray-400">DETECTED THREAT INDICATORS & KEYWORDS:</div>
              <div className="flex flex-wrap gap-2">
                {result.indicators.map((ind, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-[#1A233A] border border-gray-700 text-xs text-yellow-300 font-mono font-medium">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Advice & Guidance Box */}
          <div className="p-5 rounded-2xl bg-[#0B1020] border border-gray-800 space-y-2">
            <div className="text-xs font-bold text-[#00E5A8] font-mono uppercase flex items-center gap-2">
              <Shield className="w-4 h-4" /> Actionable Safety Guidance:
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              {result.recommended_action || result.threat_summary}
            </p>
          </div>
        </motion.div>
      )}

      {/* History */}
      {scanHistory.length > 0 && (
        <div className="glass-card border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            Recent Message Checks ({scanHistory.length})
          </h3>
          <div className="space-y-2">
            {scanHistory.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-[#0B1020] border border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${item.isAlert ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  <span className="text-gray-300 font-medium">{item.text}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${item.isAlert ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {item.category} ({item.riskScore}/100)
                  </span>
                  <span className="text-gray-500 font-mono">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
