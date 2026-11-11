import React, { useEffect, useState } from 'react';
import { GitCompare, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { PracticeSession, CompareResult } from '../types';
import { api } from '../services/api';

export const ComparePage: React.FC = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [id1, setId1] = useState<number | null>(null);
  const [id2, setId2] = useState<number | null>(null);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listSessions()
      .then((list) => {
        setSessions(list);
        if (list.length >= 2) {
          // Default to comparing earliest session with latest session
          const sorted = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          setId1(sorted[0].id);
          setId2(sorted[sorted.length - 1].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (id1 && id2) {
      api.compareSessions(id1, id2)
        .then(setComparison)
        .catch((err) => console.error("Compare error:", err));
    }
  }, [id1, id2]);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading comparison tool...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-brand-500" /> Side-by-Side Presentation Comparison
        </h1>
        <p className="text-xs text-slate-400">Compare any two speaking sessions to evaluate delta metric growth</p>
      </div>

      {/* Selectors */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Baseline Session (Session 1)</label>
          <select
            value={id1 || ''}
            onChange={(e) => setId1(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.mode}) — Score: {s.overall_score.toFixed(0)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Target Comparison Session (Session 2)</label>
          <select
            value={id2 || ''}
            onChange={(e) => setId2(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.mode}) — Score: {s.overall_score.toFixed(0)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      {comparison && (
        <div className="space-y-6">
          
          {/* AI Explanation Banner */}
          <div className="glass-card rounded-2xl p-6 border border-brand-500/40 bg-gradient-to-r from-dark-800 to-indigo-950/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-brand-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> AI Side-by-Side Comparative Diagnosis
            </div>
            <p className="text-sm font-semibold text-slate-100 leading-relaxed">
              "{comparison.ai_explanation}"
            </p>
          </div>

          {/* Comparison Matrix Table */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Metric Dimension</th>
                    <th className="py-3 px-4 text-center bg-dark-800/50">
                      {comparison.session1.title}
                    </th>
                    <th className="py-3 px-4 text-center bg-brand-500/10 text-brand-300">
                      {comparison.session2.title}
                    </th>
                    <th className="py-3 px-4 text-right">Delta Improvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Overall AI Score</td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-slate-300 bg-dark-800/50">
                      {comparison.session1.overall_score.toFixed(0)} / 100
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-brand-accent bg-brand-500/10">
                      {comparison.session2.overall_score.toFixed(0)} / 100
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                      {comparison.deltas.score_diff >= 0 ? `+${comparison.deltas.score_diff}` : comparison.deltas.score_diff} pts
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Speaking Pace (WPM)</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300 bg-dark-800/50">
                      {comparison.session1.wpm.toFixed(0)} WPM
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-cyan-400 bg-brand-500/10">
                      {comparison.session2.wpm.toFixed(0)} WPM
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {comparison.deltas.wpm_diff} WPM
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Filler Word Count</td>
                    <td className="py-3.5 px-4 text-center font-mono text-amber-400 bg-dark-800/50">
                      {comparison.session1.filler_count} fillers
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-amber-300 bg-brand-500/10">
                      {comparison.session2.filler_count} fillers
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                      {comparison.deltas.filler_diff <= 0 ? `${comparison.deltas.filler_diff}` : `+${comparison.deltas.filler_diff}`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Long Awkward Pauses</td>
                    <td className="py-3.5 px-4 text-center font-mono text-rose-400 bg-dark-800/50">
                      {comparison.session1.long_pause_count}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-emerald-400 bg-brand-500/10">
                      {comparison.session2.long_pause_count}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {comparison.session2.long_pause_count - comparison.session1.long_pause_count}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Structure Score</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300 bg-dark-800/50">
                      {comparison.session1.structure_score.toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-indigo-400 bg-brand-500/10">
                      {comparison.session2.structure_score.toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                      +{comparison.deltas.structure_diff}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
