import React, { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, Circle, RefreshCw, Flame, Target } from 'lucide-react';
import { PracticePlan, PracticePlanItem } from '../types';
import { api } from '../services/api';

export const PracticePlanPage: React.FC = () => {
  const [plan, setPlan] = useState<PracticePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlan()
      .then(setPlan)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleTask = async (day: number) => {
    try {
      const updated = await api.togglePlanTask(day);
      setPlan(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const fresh = await api.regeneratePlan();
      setPlan(fresh);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading personalized practice plan...</div>;
  if (!plan) return <div className="text-center py-20 text-slate-400">No active practice plan found.</div>;

  const completedCount = plan.schedule.filter((t) => t.completed).length;
  const progressPct = Math.round((completedCount / plan.schedule.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-dark-900 via-dark-800 to-indigo-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-bold mb-2">
            <Target className="w-3.5 h-3.5" /> Adaptive Public Speaking Drill Schedule
          </div>
          <h1 className="text-2xl font-extrabold text-white">{plan.title}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tailored daily exercises adapting to your recent filler frequency and pace metrics.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4 text-brand-cyan" /> Regenerate Plan
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
          <span>Completion Progress ({completedCount} / {plan.schedule.length} Days)</span>
          <span className="text-emerald-400 font-extrabold">{progressPct}%</span>
        </div>
        <div className="h-3 w-full bg-dark-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-brand-600 via-brand-cyan to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Day-by-Day Schedule List */}
      <div className="space-y-4">
        {plan.schedule.map((item) => (
          <div
            key={item.day}
            onClick={() => handleToggleTask(item.day)}
            className={`glass-card rounded-2xl p-5 border cursor-pointer transition-all flex items-start justify-between gap-4 ${
              item.completed
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-slate-800 hover:border-brand-500/40'
            }`}
          >
            <div className="flex items-start gap-4">
              <button className="mt-0.5 shrink-0 text-slate-400">
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-600 hover:text-brand-500" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-brand-cyan text-[10px] font-bold border border-slate-700">
                    Focus: {item.focus}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.task}</p>
              </div>
            </div>

            <div className="text-right whitespace-nowrap">
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${
                item.completed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {item.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
