import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Cpu, Terminal, Activity, ArrowRight, CheckCircle, Zap, ChevronDown, ExternalLink, FileSpreadsheet, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = ({ onOpenAuth }) => {
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();

  const features = [
    {
      icon: Terminal,
      title: 'Network Traffic Analysis',
      description: 'Ingests connection-record CSV telemetry files detailing packet duration, protocol types, network services, TCP flags, byte counts, and connection rate statistics.'
    },
    {
      icon: Cpu,
      title: 'Machine-Learning Classification',
      description: 'Executes Scikit-Learn Random Forest classification pipeline with categorical label encoding and StandardScaler feature scaling to detect malicious flow patterns.'
    },
    {
      icon: Shield,
      title: 'Risk and Severity Assessment',
      description: 'Calculates overall threat severity levels (Low, Medium, High, Critical) based on dominant attack signatures and confidence scores returned by the ML pipeline.'
    },
    {
      icon: Activity,
      title: 'Detection History & Audit Logs',
      description: 'Maintains a searchable audit trail of analyzed intrusion scans, enabling security teams to inspect threat distributions and download forensic CSV logs.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Security Report Generation',
      description: 'Generates detailed PDF security forensic reports outlining executive summaries, flagged record indices, technical explanations, and mitigation playbooks.'
    },
    {
      icon: BarChart2,
      title: 'Model Performance Benchmarking',
      description: 'Provides transparent evaluation tracking for trained machine learning models, supporting precision, recall, confusion matrix, and per-class classification metrics.'
    }
  ];

  const faqs = [
    {
      q: 'How does NeuroShield IDS analyze network traffic?',
      a: 'NeuroShield IDS ingests network flow CSV files containing connection features such as duration, protocol_type, service, flag, byte counts, and connection rates. The Python microservice processes these features through a trained machine-learning model.'
    },
    {
      q: 'What CSV feature format is required for uploads?',
      a: 'Uploaded CSV files must contain required network flow features: duration, protocol_type, service, flag, src_bytes, dst_bytes, count, srv_count, serror_rate, rerror_rate, same_srv_rate, and diff_srv_rate.'
    },
    {
      q: 'Can I export threat analysis reports for my team?',
      a: 'Yes! Every completed intrusion scan includes an instant "Download PDF Security Report" generator that formats executive summaries, technical feature breakdowns, and recommended mitigation playbooks.'
    },
    {
      q: 'How does the Flask ML service interface with the web frontend?',
      a: 'The React frontend communicates with a Node.js/Express REST gateway, which securely proxies CSV files and JSON feature payloads to the Python Flask microservice.'
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
                NETWORK INTRUSION DETECTION SYSTEM
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-white leading-tight"
              >
                AI-Powered <span className="gradient-text-primary">Network Intrusion</span> Detection
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed"
              >
                NeuroShield IDS analyzes network traffic features using machine-learning models to identify normal and malicious connection patterns, calculate threat severity and provide actionable security results.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <button
                  onClick={() => navigate('/intrusion')}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-sm sm:text-base hover:opacity-90 transition-all shadow-xl shadow-[#00E5A8]/20 hover:scale-105"
                >
                  Launch Intrusion Scanner
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl glass-card border border-gray-700 text-gray-200 font-semibold text-sm sm:text-base hover:bg-gray-800/60 transition-all hover:border-[#4F8CFF]/50"
                >
                  <Activity className="w-5 h-5 text-[#4F8CFF]" />
                  View Dashboard
                </button>

                <button
                  onClick={() => navigate('/model-performance')}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl glass-card border border-gray-800 text-gray-400 font-mono text-xs hover:text-white transition-all"
                >
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  Model Performance
                </button>
              </motion.div>

              {/* Badges */}
              <div className="pt-6 border-t border-gray-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#00E5A8]" /> Scikit-learn Random Forest</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#4F8CFF]" /> Python Flask Microservice</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#00E5A8]" /> JWT Secured Express API</span>
              </div>
            </div>

            {/* Right Interactive Telemetry Card */}
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
                    <span className="text-xs font-mono text-gray-400 ml-2">ids-telemetry-preview.sys</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    FLOW MONITOR
                  </span>
                </div>

                <div className="space-y-3 py-4 font-mono">
                  <div className="p-3 rounded-xl bg-gray-900/90 border border-red-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                        DoS
                      </div>
                      <div>
                        <p className="font-semibold text-white">Denial of Service (SYN Flood)</p>
                        <p className="text-[10px] text-gray-400">tcp / private | count: 320</p>
                      </div>
                    </div>
                    <span className="text-red-400 font-bold text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30">HIGH RISK</span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-900/90 border border-amber-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        PRB
                      </div>
                      <div>
                        <p className="font-semibold text-white">Port Scan / Reconnaissance</p>
                        <p className="text-[10px] text-gray-400">udp / dns | count: 80</p>
                      </div>
                    </div>
                    <span className="text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">MEDIUM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-900/90 border border-emerald-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        OK
                      </div>
                      <div>
                        <p className="font-semibold text-white">Normal Network Stream</p>
                        <p className="text-[10px] text-gray-400">tcp / http | SF flag</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">SAFE</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => navigate('/intrusion')}
                    className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    Test Intrusion Scanner
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">IDS Core Capabilities</h2>
          <p className="text-gray-400 text-sm">Automated machine learning classification pipeline designed for network security monitoring.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
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

      {/* Architecture Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 border border-gray-800 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Full-Stack IDS Architecture</h2>
              <p className="text-xs text-gray-400">Modular microservice architecture separating React UI, Express API Gateway, and Flask ML Engine.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800 font-mono text-xs text-[#00E5A8]">
              <Cpu className="w-4 h-4" /> ids-microservice.v1
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>Frontend Layer</span>
                <span className="text-[#00E5A8]">React + Router</span>
              </div>
              <p className="text-sm font-semibold text-white">SOC Cyber UI</p>
              <p className="text-xs text-gray-400">Built with Tailwind CSS, Recharts analytics, drag-and-drop CSV dropzone, and client-side PDF export.</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>Backend Gateway</span>
                <span className="text-[#4F8CFF]">Node.js Express</span>
              </div>
              <p className="text-sm font-semibold text-white">JWT Auth & Storage Gateway</p>
              <p className="text-xs text-gray-400">Handles JWT session security, 10 MB CSV upload validation, scan history persistence, and health checks.</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>ML Microservice</span>
                <span className="text-[#FF4D6D]">Python Flask</span>
              </div>
              <p className="text-sm font-semibold text-white">Scikit-learn Classification</p>
              <p className="text-xs text-gray-400">Executes feature encoding, StandardScaler scaling, and Random Forest classification on connection features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-gray-400">Technical insights regarding the NeuroShield IDS implementation.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-200 hover:text-white transition-colors text-sm sm:text-base"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === index ? 'rotate-180 text-[#00E5A8]' : ''}`} />
              </button>
              {activeFaq === index && (
                <div className="px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-gray-800/60 pt-3 font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-10 border border-[#00E5A8]/40 bg-gradient-to-br from-[#0B1020] via-[#111827] to-[#0B1020] text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5A8]/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-white">Ready to Run a Network Telemetry Scan?</h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Upload network connection CSV files to classify normal vs malicious connection patterns and calculate risk severity.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/intrusion')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5A8] to-[#4F8CFF] text-[#0B1020] font-bold text-sm shadow-xl shadow-[#00E5A8]/20 hover:scale-105 transition-all"
            >
              Open Intrusion Scanner
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
