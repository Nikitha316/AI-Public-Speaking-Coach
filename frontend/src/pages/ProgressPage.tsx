import React, { useEffect, useState } from 'react';
import { LineChart as LineChartIcon, TrendingUp, Sparkles, Trophy } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../services/api';

export const ProgressPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProgress()
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading progress charts...</div>;
  }

  const scoreHistory = data?.score_history || [];
  const wpmHistory = data?.wpm_history || [];
  const fillerHistory = data?.filler_history || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <LineChartIcon className="w-6 h-6 text-brand-500" /> Longitudinal Progress & Analytics
        </h1>
        <p className="text-xs text-slate-400">Track your score improvements, pace stability, and filler word reduction over time</p>
      </div>

      {/* Headline Banner */}
      <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-brand-400 shrink-0" />
        <p className="text-sm font-semibold text-slate-200">
          {data?.summary_highlight || "Great progress! Keep practicing to maintain your vocal stability."}
        </p>
      </div>

      {/* Chart 1: Overall Score Trend */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-emerald-400" /> Overall AI Presentation Score Progression
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="session_num" stroke="#94A3B8" fontSize={11} />
              <YAxis domain={[40, 100]} stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} dot={{ r: 5, fill: '#6366F1' }} name="Overall Score" />
              <Line type="monotone" dataKey="pace" stroke="#06B6D4" strokeWidth={2} strokeDasharray="5 5" name="Pace Score" />
              <Line type="monotone" dataKey="filler" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Filler Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: WPM Trend & Filler Words Reduction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WPM Trend Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-cyan" /> Speaking Pace (WPM) vs Target Benchmark
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wpmHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="session_num" stroke="#94A3B8" fontSize={11} />
                <YAxis domain={[80, 220]} stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="wpm" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4 }} name="Actual WPM" />
                <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} strokeDasharray="3 3" name="Ideal Target (150 WPM)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filler Word Reduction Bar Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" /> Filler Word Count Reduction Trend
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fillerHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="session_num" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="fillers" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Filler Words" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
