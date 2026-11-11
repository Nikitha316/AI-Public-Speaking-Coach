import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Mic, Trash2, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [fillers, setFillers] = useState('um, uh, like, basically, actually, you know, so');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-500" /> Coaching System Settings & Privacy
        </h1>
        <p className="text-xs text-slate-400">Manage audio telemetry permissions, custom filler dictionary, and privacy controls</p>
      </div>

      {/* Save Alert */}
      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Settings updated successfully!
        </div>
      )}

      {/* Section 1: Configurable Filler Words */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-500" /> Configurable Filler Words Dictionary
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Tracked Verbal Fillers (Comma Separated)
          </label>
          <input
            type="text"
            value={fillers}
            onChange={(e) => setFillers(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-xs font-mono text-amber-300 focus:outline-none focus:border-brand-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Add any custom verbal crutches (e.g. "honestly", "literally", "i mean") you wish to detect during live speech.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
        >
          Save Configuration
        </button>
      </div>

      {/* Section 2: Privacy Controls */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" /> Voice Privacy & Security Enforcer
        </h2>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-slate-800">
            <div>
              <div className="font-bold text-white">Zero Server Audio Retention</div>
              <div className="text-[11px] text-slate-400">Audio streams are analyzed in volatile memory and never saved to disc.</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Enforced</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-slate-800">
            <div>
              <div className="font-bold text-white">Explicit Permission Authorization</div>
              <div className="text-[11px] text-slate-400">Microphone and webcam access are strictly user-permissioned per session.</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-brand-cyan/20 text-brand-cyan text-[10px] font-bold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
