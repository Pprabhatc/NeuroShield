import React, { useState } from 'react';
import { Shield, Cpu, Lock, Terminal, Activity, ArrowRight, CheckCircle, Zap, Server, ChevronDown, Award, Globe, Users, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = ({ onLaunchScanner, onOpenAuth }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: Terminal,
      title: 'ML Network Intrusion Detection',
      description: 'Scans packet telemetry & connection records (NSL-KDD dataset taxonomy) using Scikit-Learn Random Forest to identify DoS, Probe, Botnet, R2L, & U2R exploits.'
    },
    {
      icon: Shield,
      title: 'NLP Scam & Fraud Detection',
      description: 'TF-IDF & Logistic Regression NLP pipeline to classify SMS, WhatsApp, & email text into OTP Fraud, Lottery Scams, Job Impersonation, & Banking Fraud.'
    },
    {
      icon: Lock,
      title: 'Phishing Email Analyzer',
      description: 'Heuristic domain verification, header anomaly inspection, and link typosquatting detection for enterprise email perimeter defense.'
    },
    {
      icon: Activity,
      title: 'Real-Time Threat Intelligence',
      description: 'Unified telemetry log dashboard featuring automated risk rating, CSV export, and PDF security report generation for SOC analysts.'
    }
  ];

  const stats = [
    { label: 'Scans Processed Daily', value: '42,800+' },
    { label: 'Detection Accuracy', value: '99.4%' },
    { label: 'Scam Categories Cataloged', value: '7 Core' },
    { label: 'Avg Inference Latency', value: '< 14ms' }
  ];

  const faqs = [
    {
      q: 'How does NeuroShield detect network intrusions?',
      a: 'NeuroShield ingests network flow CSVs containing duration, protocol type, service, flag, byte counts, and error rates. The Python microservice scales features and executes a serialized Random Forest classifier trained on NSL-KDD benchmarks.'
    },
    {
      q: 'What NLP techniques are used for scam detection?',
      a: 'The NLP engine utilizes TF-IDF n-gram vectorization combined with a tuned Logistic Regression classifier. It extracts keyword flags, computes scam probability scores, and maps content to specific threat categories.'
    },
    {
      q: 'Can I export threat analysis reports for my organization?',
      a: 'Yes! Every scan result includes an instant "Download PDF Security Report" generator that formats executive summaries, technical feature importances, and step-by-step mitigation playbooks.'
    },
    {
      q: 'How does the Flask ML service interface with the web frontend?',
      a: 'The frontend communicates with a Node.js/Express REST gateway, which securely proxies binary CSV files and JSON payloads to the Python Flask microservice listening on port 5001.'
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
                ENTERPRISE SOC THREAT DETECTION PLATFORM
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-white leading-tight"
              >
                AI-Powered <span className="gradient-text-primary">Network Intrusion</span> & NLP Scam Defense
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-300 max-w-2xl font-normal leading-relaxed"
              >
                NeuroShield IDS combines multi-class Scikit-Learn Machine Learning models with TF-IDF NLP text vectorization to stop zero-day network exploits, phishing attempts, and SMS fraud before execution.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <button
                  onClick={() => onLaunchScanner('intrusion')}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-base hover:opacity-90 transition-all shadow-xl shadow-[#00E5A8]/20 hover:scale-105"
                >
                  Launch Intrusion Scanner
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onLaunchScanner('scam')}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl glass-card border border-gray-700 text-gray-200 font-semibold text-base hover:bg-gray-800/60 transition-all hover:border-[#4F8CFF]/50"
                >
                  <Shield className="w-5 h-5 text-[#4F8CFF]" />
                  Analyze Scam Message
                </button>
              </motion.div>

              {/* Badges */}
              <div className="pt-6 border-t border-gray-800/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#00E5A8]" /> Scikit-learn Pipeline</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#4F8CFF]" /> Flask Microservice</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#00E5A8]" /> JWT Secured API</span>
              </div>
            </div>

            {/* Right Graphic / Interactive Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="glass-card rounded-2xl p-6 border border-[#00E5A8]/30 shadow-2xl relative overflow-hidden animate-float">
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF4D6D]" />
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <div className="w-3 h-3 rounded-full bg-[#00E5A8]" />
                    <span className="text-xs font-mono text-gray-400 ml-2">neuroshield-soc-monitor.sys</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    LIVE STREAM
                  </span>
                </div>

                <div className="space-y-4 py-4">
                  <div className="p-3 rounded-xl bg-gray-900/90 border border-red-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                        DoS
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">SYN Flood Attack Flagged</p>
                        <p className="text-[10px] text-gray-400">Src: 192.168.1.105 | Target: HTTP 80</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-red-400 font-bold">99.4% CONF</span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-900/90 border border-amber-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        NLP
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">OTP Fraud Telemetry</p>
                        <p className="text-[10px] text-gray-400">Category: Banking Scam</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-bold">94.8% RISK</span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-900/90 border border-emerald-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        OK
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Normal Packet Flow</p>
                        <p className="text-[10px] text-gray-400">Protocol: TCP | SF Flag</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">CLEAN</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => onLaunchScanner('dashboard')}
                    className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    Open Live Analytics Dashboard
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl glass-card border border-gray-800">
          {stats.map((s, i) => (
            <div key={i} className="text-center p-4 border-r last:border-0 border-gray-800">
              <p className="text-3xl font-extrabold font-sans text-white gradient-text-primary">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Commercial-Grade AI Features</h2>
          <p className="text-gray-400 text-sm">Designed like CrowdStrike and Microsoft Defender to provide automated threat intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="glass-card rounded-2xl p-6 border border-gray-800 hover:border-[#00E5A8]/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Architecture & AI Pipeline Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 border border-gray-800 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Full-Stack SaaS Architecture</h2>
              <p className="text-xs text-gray-400">Modular design connecting React Client, Node.js Gateway, and Flask ML Microservice.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800 font-mono text-xs text-[#00E5A8]">
              <Cpu className="w-4 h-4" /> microservice-architecture.v1
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>Frontend Layer</span>
                <span className="text-[#00E5A8]">React + Vite</span>
              </div>
              <p className="text-sm font-semibold text-white">Dark Futuristic Cyber UI</p>
              <p className="text-xs text-gray-400">Built with Tailwind CSS, Recharts analytics, Framer Motion animations, and client-side PDF export.</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>Backend Gateway</span>
                <span className="text-[#4F8CFF]">Node.js Express</span>
              </div>
              <p className="text-sm font-semibold text-white">JWT Auth & Storage Gateway</p>
              <p className="text-xs text-gray-400">Manages user security, JWT authentication, CSV upload buffering, scan history persistence, and analytics aggregation.</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>ML Microservice</span>
                <span className="text-[#FF4D6D]">Python Flask</span>
              </div>
              <p className="text-sm font-semibold text-white">Scikit-learn ML & TF-IDF NLP</p>
              <p className="text-xs text-gray-400">Executes multi-class Random Forest network predictions and TF-IDF Logistic Regression scam classification with keyword highlights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-gray-400">Technical insights regarding the NeuroShield platform implementation.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-200 hover:text-white transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === index ? 'rotate-180 text-[#00E5A8]' : ''}`} />
              </button>
              {activeFaq === index && (
                <div className="px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-gray-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-10 border border-[#00E5A8]/40 bg-gradient-to-br from-[#0B1020] via-[#111827] to-[#0B1020] text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5A8]/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-white">Ready to Deploy NeuroShield Security Telemetry?</h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Experience real-time network intrusion monitoring and NLP scam protection in an integrated enterprise dashboard.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => onLaunchScanner('dashboard')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-sm shadow-xl shadow-[#00E5A8]/20 hover:scale-105 transition-all"
            >
              Enter SOC Control Dashboard
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
