import React, { useState } from 'react';
import { Shield, Sparkles, AlertCircle, CheckCircle2, Download, RefreshCw, Zap, Tag, Info, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { generateSecurityReport } from '../utils/pdfGenerator';

export const ScamDetector = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  const presets = [
    {
      label: 'OTP Fraud',
      text: 'Do not share: Your SBI NetBanking OTP is 849204. If you did not request this, call support at 1-800-FAKE-NUM immediately to cancel transaction of Rs 45,000.'
    },
    {
      label: 'Bank Account Lock',
      text: 'ALERT: Your bank account will be suspended in 24 hours due to missing KYC update. Click http://bank-kyc-portal-online.in to update PAN & Aadhar.'
    },
    {
      label: 'Crypto Giveaway',
      text: 'Double your Bitcoin in 24 hours! Deposit BTC to official Musk GiveAway wallet address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    {
      label: 'Legitimate Meeting',
      text: 'Hi Team, attached is the revised project status deck for Q3 review. Let me know your thoughts.'
    }
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) {
      addToast('Please paste or type text to analyze.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/nlp/detect-scam', { text });
      if (res.data.success) {
        setResult(res.data);
        addToast('NLP Scam Analysis Complete!', 'success');
      }
    } catch (err) {
      addToast('Error running scam analysis: ' + (err.response?.data?.message || err.message), 'error');
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateSecurityReport(result, 'NLP Scam & Social Engineering Incident Report');
      addToast('Downloading PDF Security Report...', 'success');
    }
  };

  // Helper to render text with highlighted keywords
  const renderHighlightedText = () => {
    if (!result || !result.flagged_keywords || result.flagged_keywords.length === 0) {
      return <p className="text-sm text-gray-200 leading-relaxed font-sans">{text}</p>;
    }

    const wordsToHighlight = result.flagged_keywords.map(k => k.word.toLowerCase());
    const regex = new RegExp(`\\b(${wordsToHighlight.join('|')})\\b`, 'gi');

    const parts = text.split(regex);

    return (
      <p className="text-sm text-gray-200 leading-relaxed font-sans">
        {parts.map((part, i) => {
          const isMatch = wordsToHighlight.includes(part.toLowerCase());
          if (isMatch) {
            return (
              <mark key={i} className="bg-red-500/30 text-red-300 px-1 py-0.5 rounded border border-red-500/50 font-semibold font-mono">
                {part}
              </mark>
            );
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">NLP Scam & Fraud Detector</h1>
          <span className="px-2.5 py-1 rounded-full bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/30 font-mono text-xs">
            TF-IDF + LOGISTIC REGRESSION
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Paste SMS, WhatsApp messages, or emails to detect phishing, lottery scams, OTP fraud, and investment bait.</p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-gray-400 mr-2">Try Sample Scenarios:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setText(p.text);
              setResult(null);
            }}
            className="px-3 py-1 rounded-xl glass-card border border-gray-800 hover:border-[#00E5A8]/50 text-xs font-medium text-gray-300 hover:text-white transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Input Editor */}
      <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300 font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E5A8]" />
            MESSAGE TEXT EDITOR
          </label>
          <button
            onClick={() => { setText(''); setResult(null); }}
            className="text-[11px] font-mono text-gray-500 hover:text-gray-300 transition-colors"
          >
            Clear Text
          </button>
        </div>

        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste suspicious SMS, WhatsApp text, or email body here..."
          className="w-full p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#00E5A8] transition-colors leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-mono text-gray-500">
            Character count: {text.length}
          </span>

          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-[#00E5A8]/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing TF-IDF Pipeline...
              </>
            ) : (
              <>
                Analyze Text Payloads
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          
          {/* Main Risk Gauge Banner */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Probability Circle Meter */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 border-r-0 lg:border-r border-gray-800">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke="#1F293D" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke={result.scam_probability > 60 ? '#FF4D6D' : (result.scam_probability > 30 ? '#F59E0B' : '#00E5A8')}
                    strokeWidth="10"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * result.scam_probability) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold font-mono text-white">{result.scam_probability}%</span>
                  <span className="block text-[10px] text-gray-400 font-mono">SCAM PROBABILITY</span>
                </div>
              </div>
            </div>

            {/* Right Summary Metadata */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono ${
                    result.risk_level.includes('Critical') || result.risk_level.includes('High')
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {result.risk_level.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-gray-800 text-gray-300 font-mono text-xs border border-gray-700">
                    Category: {result.category}
                  </span>
                </div>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/40 hover:bg-[#00E5A8]/20 transition-all font-mono text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Security Report
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 font-mono mb-1">AI DETECTED EXPLANATION</h4>
                <p className="text-sm text-gray-200 leading-relaxed font-sans">{result.explanation}</p>
              </div>

              {/* Flagged keywords */}
              {result.flagged_keywords && result.flagged_keywords.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 font-mono mb-2">FLAGGED SUSPICIOUS KEYWORDS</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.flagged_keywords.map((kw, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono">
                        <Tag className="w-3 h-3" />
                        {kw.word} ({kw.tag})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Highlighted Text Inspector */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 font-mono">TEXT FORENSIC HIGHLIGHT INSPECTOR</h4>
            <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800">
              {renderHighlightedText()}
            </div>
          </div>

          {/* Recommendations Box */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00E5A8]" />
              RECOMMENDED SAFETY ACTIONS PLAYBOOK
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-start gap-3 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5A8] shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
