import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Cpu, Terminal, Activity, ArrowRight, CheckCircle, Zap, ChevronDown, ExternalLink, FileSpreadsheet, BarChart2, AlertTriangle, Scale, Lock, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = ({ onOpenAuth }) => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [nlpInput, setNlpInput] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [analyzingNlp, setAnalyzingNlp] = useState(false);
  const navigate = useNavigate();

  const handleNlpAnalyze = async (sampleText) => {
    const textToAnalyze = sampleText || nlpInput;
    if (!textToAnalyze.trim()) return;

    if (sampleText) setNlpInput(sampleText);
    setAnalyzingNlp(true);
    setNlpResult(null);

    try {
      const response = await fetch('/api/nlp/scam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze })
      });
      const data = await response.json();
      setNlpResult(data);
    } catch (err) {
      setNlpResult({
        success: false,
        message: 'Failed to analyze text. Please ensure backend services are active.'
      });
    } finally {
      setAnalyzingNlp(false);
    }
  };

  const sampleScams = [
    {
      label: '🚨 Fake Police Warrant',
      text: 'FINAL POLICE NOTICE: Non-bailable arrest warrant issued under section 420 by Cyber Crime Branch Delhi against your IP. Pay settlement fine of Rs 25,000 immediately to avoid arrest squad visiting your address.'
    },
    {
      label: '⚖️ Supreme Court Summons',
      text: 'SUPREME COURT SUMMONS: Case No. SC-84920/2026. You are charged with illegal digital asset transfer. Pay legal fee via UPI or face immediate freezing of bank accounts.'
    },
    {
      label: '🎣 Netflix Phishing',
      text: 'URGENT: Your Netflix account payment failed. Update details immediately at https://netflix-verify-login.sec-auth.com or account will be terminated.'
    },
    {
      label: '🔐 Bank OTP Fraud',
      text: 'Do not share: Your SBI NetBanking OTP is 849204. Call support at 1-800-FAKE-NUM immediately to cancel transaction of Rs 45,000.'
    }
  ];

  const features = [
    {
      icon: Scale,
      title: 'Fake Legal Notice Fraud Detection',
      description: 'Advanced NLP + TF-IDF engine trained to spot fake arrest warrants, police threats, CBI extortion notices, and court summons lures.'
    },
    {
      icon: Terminal,
      title: 'CICIDS2017 Network Telemetry ML',
      description: 'Machine Learning Random Forest model trained on CICIDS2017 flow telemetry (Flow Duration, Flow Bytes/s, SYN/ACK Flags, Destination Port) to spot DoS, Botnet & Probe attacks.'
    },
    {
      icon: AlertTriangle,
      title: '0–100 Risk Scoring & Real-Time Alerts',
      description: 'Generates dynamic risk score meters (0–100) and triggers instant real-time security alert banners for high-severity threats (>50/100).'
    },
    {
      icon: Shield,
      title: 'Actionable Threat Mitigation Playbooks',
      description: 'Provides step-by-step security guidance, firewall rules, domain block lists, and legal notice verification protocols for detected threats.'
    },
    {
      icon: FileSpreadsheet,
      title: 'PDF Executive Threat Reports',
      description: 'Generates one-click PDF security audit reports detailing flagged telemetry, indicator lists, and compliance summaries.'
    },
    {
      icon: BarChart2,
      title: 'Real-Time SOC Analytics Dashboard',
      description: 'Interactive Recharts visualizations tracking live intrusion trends, risk level distributions, and attack category breakdowns.'
    }
  ];

  const faqs = [
    {
      q: 'How does NeuroShield IDS detect Fake Legal Notices and Scams?',
      a: 'NeuroShield uses an NLP TF-IDF vectorization model combined with supervised Logistic Regression & keyword heuristic dictionaries trained on thousands of fake police warrants, court summons, phishing emails, and OTP fraud lures.'
    },
    {
      q: 'What is the CICIDS2017 Dataset integration?',
      a: 'The CICIDS2017 dataset is a benchmark cybersecurity dataset containing real-world network flow telemetry. NeuroShield ML models evaluate 13+ flow features (Flow Duration, Flow Bytes/s, Packet Rates, SYN/ACK Flags) to identify DoS/DDoS, Botnet, PortScan, and Infiltration attacks.'
    },
    {
      q: 'How is the Risk Score calculated?',
      a: 'The Risk Score is evaluated on a 0–100 scale based on prediction confidence, keyword severity, heuristic URL checks, and attack classification. Any score exceeding 50 triggers immediate real-time security alerts.'
    },
    {
      q: 'What should I do if a Fake Legal Notice is detected?',
      a: 'NeuroShield provides immediate mitigation guidance: Official government and law enforcement agencies (Police, Courts, CBI) NEVER demand wire/crypto payments via SMS or messaging apps. You should verify case numbers directly at your local police station or official court portal.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">

      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#00E5A8]/20 to-[#4F8CFF]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-[#00E5A8]/30 text-xs font-mono text-[#00E5A8]"
              >
                <Zap className="w-3.5 h-3.5" />
                CICIDS2017 ML & NLP FAKE LEGAL NOTICE DETECTOR
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-white leading-tight"
              >
                AI Cybersecurity <span className="gradient-text-primary">Network & Scam</span> Platform
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed"
              >
                NeuroShield IDS uses <strong>CICIDS2017 Machine Learning models</strong> and <strong>NLP TF-IDF algorithms</strong> to detect network intrusions, phishing, financial fraud, and <strong>Fake Legal Notices</strong> with real-time 0–100 risk scoring and actionable mitigation recommendations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2"
              >
                <Link
                  to="/intrusion"
                  className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-[#00E5A8] to-[#00B386] text-[#0B1020] font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,229,168,0.4)] transition-all flex items-center gap-2 group"
                >
                  Analyze CICIDS2017 Telemetry
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 rounded-lg glass-card border border-gray-700 text-gray-200 font-semibold text-sm hover:border-[#00E5A8] hover:text-[#00E5A8] transition-all flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-[#00E5A8]" />
                  View SOC Analytics
                </Link>
              </motion.div>
            </div>

            {/* Right Card / Interactive Demo Preview */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="glass-card border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden bg-[#111827]/80 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="text-xs font-mono text-gray-400 ml-2">live-soc-telemetry.v2</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#00E5A8]/10 border border-[#00E5A8]/30 text-[#00E5A8]">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#1A233A] border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400 font-mono">CICIDS2017 ML MODEL</div>
                      <div className="text-sm font-semibold text-white">Random Forest (13 Flow Features)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#00E5A8] font-mono font-bold">99.4% ACCURACY</div>
                      <div className="text-[10px] text-gray-400">Port 5001 Active</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#1A233A] border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400 font-mono">NLP TF-IDF SCAM ENGINE</div>
                      <div className="text-sm font-semibold text-white">Fake Legal Notice & Phishing</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#00E5A8] font-mono font-bold">4000 TF-IDF NGRAMS</div>
                      <div className="text-[10px] text-gray-400">Risk Meter Enabled</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-red-400 font-mono uppercase tracking-wide">Real-Time Threat Triggered</div>
                      <div className="text-xs text-gray-300">
                        Fake Legal Warrant Extortion detected (Risk Score: 95/100). Do NOT transfer funds.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Live NLP Scam & Fake Legal Notice Detector Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card border border-gray-800 rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-[#111827] to-[#0D1322] shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/30 text-xs font-mono text-[#00E5A8]">
              <Scale className="w-3.5 h-3.5" />
              LIVE INTERACTIVE SCAM & FAKE LEGAL NOTICE DETECTOR
            </div>
            <h2 className="text-3xl font-extrabold text-white">Try NLP + TF-IDF Threat Analysis Live</h2>
            <p className="text-gray-400 text-sm">
              Paste suspect messages, fake police warrants, court summons, or phishing emails below to calculate immediate risk score (0–100) and actionable security recommendations.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-xs text-gray-400 py-1.5 font-mono">Test Sample:</span>
              {sampleScams.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNlpAnalyze(s.text)}
                  className="px-3 py-1.5 rounded-lg bg-[#1A233A] border border-gray-700 hover:border-[#00E5A8] hover:text-[#00E5A8] text-xs text-gray-300 font-medium transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Textarea Input */}
            <div className="relative">
              <textarea
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                placeholder="Paste suspicious SMS, email, WhatsApp text, or fake police/court legal notice here..."
                rows={4}
                className="w-full rounded-2xl bg-[#0B1020] border border-gray-700 focus:border-[#00E5A8] focus:ring-1 focus:ring-[#00E5A8] p-4 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all"
              />
              <button
                onClick={() => handleNlpAnalyze()}
                disabled={analyzingNlp || !nlpInput.trim()}
                className="absolute bottom-4 right-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#00B386] text-[#0B1020] font-bold text-xs hover:shadow-[0_0_15px_rgba(0,229,168,0.4)] disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {analyzingNlp ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing TF-IDF...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Run NLP Analysis
                  </>
                )}
              </button>
            </div>

            {/* Results Display Card */}
            {nlpResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl border ${
                  nlpResult.is_alert
                    ? 'bg-red-950/30 border-red-500/40'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                } space-y-4`}
              >
                {/* Header Risk Score */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                  <div>
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">THREAT CATEGORY CLASSIFICATION</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                      {nlpResult.threat_category || 'Analyzed Text'}
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                          nlpResult.is_alert ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {nlpResult.alert_level || 'Evaluated'}
                      </span>
                    </div>
                  </div>

                  {/* Risk Score Gauge Pill */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-mono">RISK SCORE (0-100)</div>
                      <div
                        className={`text-2xl font-black font-mono ${
                          nlpResult.risk_score > 70
                            ? 'text-red-400'
                            : nlpResult.risk_score > 40
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {nlpResult.risk_score || 0} / 100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Alert Banner if High Threat */}
                {nlpResult.is_alert && (
                  <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <div className="text-xs text-red-200 font-medium">
                      <strong>REAL-TIME SECURITY ALERT:</strong> High risk threat score detected! Do not follow payment demands or unverified link prompts.
                    </div>
                  </div>
                )}

                {/* Key Indicators */}
                {nlpResult.indicators && nlpResult.indicators.length > 0 && (
                  <div>
                    <div className="text-xs font-mono text-gray-400 mb-2">DETECTED KEYWORD INDICATORS:</div>
                    <div className="flex flex-wrap gap-2">
                      {nlpResult.indicators.map((ind, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-[#1A233A] border border-gray-700 text-xs text-yellow-300 font-mono">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Recommendations */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-gray-800 space-y-1.5">
                  <div className="text-xs font-bold text-[#00E5A8] font-mono uppercase flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Actionable Mitigation Recommendation:
                  </div>
                  <div className="text-xs text-gray-200 leading-relaxed font-sans">
                    {nlpResult.recommended_action || nlpResult.threat_summary}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-white font-sans">
            Enterprise Cybersecurity Platform Capabilities
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto font-normal">
            Combining state-of-the-art machine-learning models trained on CICIDS2017 telemetry and advanced NLP TF-IDF text intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-2xl border border-gray-800 hover:border-[#00E5A8]/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#00E5A8]/10 border border-[#00E5A8]/30 flex items-center justify-center text-[#00E5A8] mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-sans mb-2">{feat.title}</h3>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white font-sans">Frequently Asked Questions</h2>
          <p className="text-gray-400 text-sm font-normal">Technical architecture, dataset specs, and detection methodology.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-card border border-gray-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-[#00E5A8] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-180 text-[#00E5A8]' : 'text-gray-500'}`} />
              </button>

              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-300 leading-relaxed border-t border-gray-800/60 font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
