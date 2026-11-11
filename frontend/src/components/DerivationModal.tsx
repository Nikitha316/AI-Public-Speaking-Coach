import React from 'react';
import { X, Calculator, Info, CheckCircle2 } from 'lucide-react';
import { ScoreDerivation } from '../types';

interface DerivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  derivation: ScoreDerivation;
}

export const DerivationModal: React.FC<DerivationModalProps> = ({ isOpen, onClose, derivation }) => {
  if (!isOpen || !derivation) return null;

  const subScores = derivation.sub_scores || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-2xl max-w-2xl w-full border border-slate-700 bg-dark-900 p-6 overflow-y-auto max-h-[90vh] shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Score Derivation Breakdown</h3>
              <p className="text-xs text-slate-400">Transparent mathematical formula behind your score</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Formula Box */}
        <div className="p-4 rounded-xl bg-dark-800 border border-brand-500/30 mb-6">
          <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Info className="w-4 h-4" /> Weighted Score Formula
          </div>
          <code className="text-sm font-mono text-emerald-300 block bg-dark-900/90 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
            {derivation.formula || '0.20*Pace + 0.15*Filler + 0.15*Pause + 0.15*Clarity + 0.15*Structure + 0.10*Vocab + 0.05*Time + 0.05*Delivery'}
          </code>
          <div className="mt-2 text-xs text-slate-400 flex justify-between items-center">
            <span>Overall Score Calculated:</span>
            <span className="text-base font-extrabold text-white bg-brand-500/20 px-3 py-0.5 rounded-full border border-brand-500/40">
              {derivation.overall_score || 0} / 100
            </span>
          </div>
        </div>

        {/* Metric Derivation Items */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Metric Sub-Score Components</h4>

          {Object.entries(subScores).map(([key, item]) => {
            const label = key.replace('_score', '').replace('_', ' ').toUpperCase();
            const scoreVal = item.score ?? 0;
            const weight = derivation.weights?.[key.replace('_score', '')] ?? 0;

            return (
              <div key={key} className="p-3 rounded-xl bg-dark-800/60 border border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-brand-accent" />
                    <span className="text-xs font-bold text-white">{label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Weight: {(weight * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-6">{item.reason || 'Calculated based on quantitative baseline bounds.'}</p>
                </div>

                <div className="text-right whitespace-nowrap">
                  <span className="text-sm font-extrabold text-emerald-400">{scoreVal.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 block">/ 100</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-md transition-all"
          >
            Close Derivation Window
          </button>
        </div>
      </div>
    </div>
  );
};
