import React from 'react';
import { Gauge, Zap, Flame } from 'lucide-react';
import { SpeakingMode } from '../types';

interface PaceGaugeProps {
  wpm: number;
  mode: SpeakingMode;
}

export const PaceGauge: React.FC<PaceGaugeProps> = ({ wpm, mode }) => {
  const modeRanges: Record<string, { min: number; targetMin: number; targetMax: number; max: number }> = {
    presentation: { min: 110, targetMin: 130, targetMax: 160, max: 185 },
    interview: { min: 100, targetMin: 120, targetMax: 150, max: 175 },
    elevator_pitch: { min: 130, targetMin: 145, targetMax: 175, max: 195 },
    classroom: { min: 95, targetMin: 110, targetMax: 140, max: 165 },
    general: { min: 110, targetMin: 130, targetMax: 160, max: 185 },
  };

  const range = modeRanges[mode] || modeRanges.general;

  let statusText = 'Optimal Pace';
  let statusColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/15 border-emerald-500/30';
  let barPercentage = Math.min(100, Math.max(5, (wpm / 220) * 100));

  if (wpm === 0) {
    statusText = 'Listening...';
    statusColor = 'text-slate-400';
    badgeBg = 'bg-slate-800 border-slate-700';
  } else if (wpm < range.targetMin) {
    statusText = 'Slower than Target';
    statusColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/15 border-amber-500/30';
  } else if (wpm > range.targetMax) {
    statusText = 'Faster than Target';
    statusColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/15 border-rose-500/30';
  }

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Speaking Pace (WPM)</div>
            <div className="text-xl font-extrabold text-white flex items-center gap-2">
              {wpm.toFixed(0)} <span className="text-xs font-normal text-slate-400">words/min</span>
            </div>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg} ${statusColor} flex items-center gap-1.5`}>
          {wpm > range.targetMax ? <Flame className="w-3.5 h-3.5 animate-bounce" /> : <Zap className="w-3.5 h-3.5" />}
          {statusText}
        </div>
      </div>

      {/* Target Progress Bar with Marker */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-dark-900 rounded-full overflow-hidden p-0.5 relative border border-slate-800 flex items-center">
          {/* Target Zone Highlight */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-500/25 border-x border-emerald-500/40"
            style={{
              left: `${(range.targetMin / 220) * 100}%`,
              width: `${((range.targetMax - range.targetMin) / 220) * 100}%`,
            }}
          />
          {/* Dynamic Fill Indicator */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              wpm > range.targetMax ? 'bg-rose-500' : wpm < range.targetMin ? 'bg-amber-500' : 'bg-gradient-to-r from-brand-500 to-emerald-400'
            }`}
            style={{ width: `${barPercentage}%` }}
          />
        </div>

        {/* Axis Labels */}
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
          <span>0</span>
          <span>{range.targetMin} WPM</span>
          <span className="text-emerald-400 font-bold">Target ({range.targetMin}-{range.targetMax})</span>
          <span>220+</span>
        </div>
      </div>
    </div>
  );
};
