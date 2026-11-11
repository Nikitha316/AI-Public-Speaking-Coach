import React, { useEffect, useState } from 'react';
import { 
  PlayCircle, 
  Sparkles, 
  Trophy, 
  TrendingUp, 
  Flame, 
  Clock, 
  ChevronRight, 
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { PracticeSession } from '../types';
import { api } from '../services/api';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  onSelectSession: (id: number) => void;
  onStartDemo: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActiveTab,
  onSelectSession,
  onStartDemo,
}) => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [progressSummary, setProgressSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listSessions(), api.getProgress()])
      .then(([sessionList, prog]) => {
        setSessions(sessionList);
        setProgressSummary(prog);
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const latestSession = sessions[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-dark-900 via-dark-800 to-indigo-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> AI Executive Speaking Coach Active
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Master Your <span className="bg-gradient-to-r from-brand-accent via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Next Presentation?</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Get real-time vocal feedback, filler word tracking, structure scoring, and personalized daily practice plans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('practice')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl glow-indigo hover:scale-105 transition-all"
            >
              <PlayCircle className="w-5 h-5" />
              Start Live Practice
            </button>

            <button
              onClick={onStartDemo}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-dark-800 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              Instant Demo
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average AI Score</div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {progressSummary?.avg_overall_score || 0} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> High Performance Target: 85+
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Practice Sessions</div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {progressSummary?.total_sessions || 0}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-cyan" /> Recorded across all modes
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filler Reduction</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">
              {progressSummary?.filler_reduction_pct ? `-${progressSummary.filler_reduction_pct}%` : '42%'}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Over recent sessions</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Practice Streak</div>
            <div className="text-3xl font-extrabold text-amber-400 mt-1 flex items-center gap-1.5">
              5 <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Daily goal: 1 session/day</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* AI Daily Coach Insight Alert */}
      <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold text-brand-400 uppercase tracking-wider">AI Coach Focus Directive</div>
          <p className="text-sm text-slate-200 font-medium">
            "{progressSummary?.summary_highlight || 'Your filler words decreased by 42% over recent sessions! Continue placing a 2-second silent pause after key conclusion statements.'}"
          </p>
        </div>
      </div>

      {/* Recent Practice Sessions Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Speaking Practice Sessions</h3>
            <p className="text-xs text-slate-400">Click any session to view complete detailed multi-metric report</p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            View All History <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No practice sessions found. Click "Start Live Practice" or "Instant Demo" to create your first session!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Session Title & Topic</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Pace (WPM)</th>
                  <th className="py-3 px-4">Fillers</th>
                  <th className="py-3 px-4">Overall Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.slice(0, 5).map((s) => (
                  <tr 
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{s.title}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{s.topic || 'General Practice'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize text-[10px] font-medium border border-slate-700">
                        {s.mode.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {s.wpm.toFixed(0)} <span className="text-[10px] text-slate-500">WPM</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {s.filler_count}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-accent font-extrabold text-xs border border-brand-accent/30">
                        {s.overall_score.toFixed(0)} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1 ml-auto">
                        View Report <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
