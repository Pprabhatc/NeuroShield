import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, AlertCircle, CheckCircle, BarChart3, Database, Layers } from 'lucide-react';
import api from '../services/api';

export const ModelPerformance = () => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/model/performance');
      if (res.data.success) {
        setPerformance(res.data);
      }
    } catch (err) {
      console.warn('Model performance endpoint check:', err);
      setError(err.response?.data?.message || 'Failed to fetch model evaluation status.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const isPending = !performance || performance.status === 'pending' || !performance.metrics;

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Model Evaluation & Performance</h1>
            <span className="px-2.5 py-1 rounded-full bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/30 font-mono text-xs">
              ML BENCHMARKS
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Official evaluation metrics, confusion matrix, and feature importances for trained IDS classifiers.</p>
        </div>

        <button
          onClick={fetchPerformance}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card border border-gray-800 text-xs font-mono text-gray-300 hover:text-white transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Evaluation
        </button>
      </div>

      {/* Honest Pending Evaluation Card */}
      {isPending ? (
        <div className="glass-card rounded-3xl p-8 border border-amber-500/30 text-center space-y-6 max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Model Evaluation Pending</h3>
            <p className="text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
              Model evaluation results have not been generated yet. Run the model-training and evaluation pipeline to populate this page.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-left font-mono text-xs text-gray-400 space-y-2 max-w-xl mx-auto">
            <span className="text-[#00E5A8] font-bold block">Pipeline Instructions:</span>
            <p>1. Prepare training dataset (e.g. NSL-KDD network flow features).</p>
            <p>2. Execute model evaluation script to calculate precision, recall, and F1 scores.</p>
            <p>3. Export <code className="text-white">evaluation_results.json</code> to register real benchmarks.</p>
          </div>
        </div>
      ) : (
        /* Render Genuine Metrics when available */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-2xl p-5 border border-gray-800">
              <span className="text-xs font-semibold text-gray-400 font-mono">ACCURACY</span>
              <p className="text-3xl font-extrabold text-[#00E5A8] mt-2 font-mono">{performance.metrics.accuracy}%</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-gray-800">
              <span className="text-xs font-semibold text-gray-400 font-mono">PRECISION</span>
              <p className="text-3xl font-extrabold text-[#4F8CFF] mt-2 font-mono">{performance.metrics.precision}%</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-gray-800">
              <span className="text-xs font-semibold text-gray-400 font-mono">RECALL</span>
              <p className="text-3xl font-extrabold text-amber-400 mt-2 font-mono">{performance.metrics.recall}%</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-gray-800">
              <span className="text-xs font-semibold text-gray-400 font-mono">F1-SCORE</span>
              <p className="text-3xl font-extrabold text-purple-400 mt-2 font-mono">{performance.metrics.f1}%</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
