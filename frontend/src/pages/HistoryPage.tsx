import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Search, ChevronRight, Filter } from 'lucide-react';
import { PracticeSession } from '../types';
import { api } from '../services/api';

interface HistoryPageProps {
  onSelectSession: (id: number) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectSession }) => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listSessions()
      .then(setSessions)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sessions.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.topic && s.topic.toLowerCase().includes(search.toLowerCase()));
    const matchMode = selectedMode === 'all' || s.mode === selectedMode;
    return matchSearch && matchMode;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-brand-500" /> Session History & Performance Archive
          </h1>
          <p className="text-xs text-slate-400">Review all previously recorded public speaking sessions</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic or session title..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-3 py-2 rounded-xl bg-dark-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Speaking Modes</option>
            <option value="presentation">Presentation</option>
            <option value="interview">Interview</option>
            <option value="elevator_pitch">Elevator Pitch</option>
            <option value="classroom">Classroom</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading history...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No matching practice sessions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Title & Topic</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Pace</th>
                  <th className="py-3 px-4">Fillers</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((s) => (
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
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize text-[10px] border border-slate-700">
                        {s.mode.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {s.actual_duration_seconds.toFixed(0)}s
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
