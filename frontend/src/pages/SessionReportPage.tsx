import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Calculator, 
  Clock, 
  ArrowLeft, 
  FileText, 
  Flame, 
  Download,
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { PracticeSession } from '../types';
import { api } from '../services/api';
import { DerivationModal } from '../components/DerivationModal';

interface SessionReportPageProps {
  sessionId: number;
  onBack: () => void;
  onGoToPlan: () => void;
}

export const SessionReportPage: React.FC<SessionReportPageProps> = ({ sessionId, onBack, onGoToPlan }) => {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDerivationModal, setShowDerivationModal] = useState<boolean>(false);

  useEffect(() => {
    api.getSessionDetail(sessionId)
      .then((data) => setSession(data))
      .catch((err) => console.error("Error fetching session detail:", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleDeleteSession = async () => {
    if (confirm("Are you sure you want to delete this practice session for privacy?")) {
      try {
        await api.deleteSession(sessionId);
        onBack();
      } catch (err) {
        alert("Error deleting session");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400 animate-pulse">
        Generating multi-metric AI speech report...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20 text-slate-400 space-y-4">
        <p>Session not found.</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-white">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Practice History
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onDeleteSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Session Data
          </button>
          
          <button
            onClick={onGoToPlan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <CalendarCheck className="w-4 h-4" /> View 7-Day Practice Plan
          </button>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-dark-900 via-dark-800 to-indigo-950/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Score Wheel */}
          <div className="flex items-center gap-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="62" stroke="#1E293B" strokeWidth="12" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke="url(#scoreGrad)"
                  strokeWidth="12"
                  strokeDasharray="390"
                  strokeDashoffset={390 - (390 * (session.overall_score / 100))}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="50%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">{session.overall_score.toFixed(0)}</span>
                <span className="text-xs font-semibold text-slate-400 block">/ 100</span>
              </div>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
                {session.mode.replace('_', ' ')} Mode
              </span>
              <h1 className="text-2xl font-extrabold text-white mt-1">{session.title}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-cyan" /> Duration: {session.actual_duration_seconds.toFixed(0)}s ({session.total_words} words)
              </p>

              <button
                onClick={() => setShowDerivationModal(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" /> View Mathematical Derivation Formula
              </button>
            </div>
          </div>

          {/* Quick Metrics Badge Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="p-3 rounded-xl bg-dark-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Speaking Pace</span>
              <span className="text-lg font-mono font-extrabold text-white">{session.wpm.toFixed(0)} <span className="text-xs font-normal text-slate-500">WPM</span></span>
            </div>
            <div className="p-3 rounded-xl bg-dark-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Filler Count</span>
              <span className="text-lg font-mono font-extrabold text-amber-400">{session.filler_count}</span>
            </div>
            <div className="p-3 rounded-xl bg-dark-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Natural Pauses</span>
              <span className="text-lg font-mono font-extrabold text-emerald-400">{session.pause_count}</span>
            </div>
            <div className="p-3 rounded-xl bg-dark-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Structure</span>
              <span className="text-lg font-mono font-extrabold text-indigo-400">{session.structure_score.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Sub-Score Metric Grid */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-brand-500" /> Multi-Metric Score Breakdown
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Speaking Pace', score: session.pace_score },
            { label: 'Speech Clarity', score: session.clarity_score },
            { label: 'Filler Control', score: session.filler_score },
            { label: 'Pause Quality', score: session.pause_score },
            { label: 'Structure', score: session.structure_score },
            { label: 'Vocabulary', score: session.vocabulary_score },
            { label: 'Time Management', score: session.time_score },
            { label: 'Delivery Signal', score: session.delivery_score },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">{item.label}</span>
                <span className="font-extrabold text-emerald-400">{item.score.toFixed(0)}</span>
              </div>
              <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-brand-accent rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Presentation Structure Analysis */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-cyan" /> Presentation Structure Evaluation ({session.structure_score.toFixed(0)}/100)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Opening & Hook</span>
              <span className="text-emerald-400">{session.opening_score.toFixed(0)} / 100</span>
            </div>
            <p className="text-[11px] text-slate-400">Hook, topic introduction, and initial value statement.</p>
          </div>

          <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Main Body & Transitions</span>
              <span className="text-indigo-400">{session.body_score.toFixed(0)} / 100</span>
            </div>
            <p className="text-[11px] text-slate-400">Logical progression, evidence, and transition markers.</p>
          </div>

          <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Conclusion & Summary</span>
              <span className="text-brand-cyan">{session.conclusion_score.toFixed(0)} / 100</span>
            </div>
            <p className="text-[11px] text-slate-400">Key takeaway summary and clear call to action.</p>
          </div>
        </div>
      </div>

      {/* AI Content Feedback: Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> What You Did Well
          </h3>
          <ul className="space-y-3">
            {session.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                {str}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="glass-card rounded-2xl p-6 border border-amber-500/30 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Priority Areas to Improve
          </h3>
          <ul className="space-y-3">
            {session.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                {imp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sentence Clarity Rewrite Suggestions */}
      {session.clarity_suggestions && session.clarity_suggestions.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan" /> Sentence Clarity Rewrite Suggestions
          </h3>

          <div className="space-y-4">
            {session.clarity_suggestions.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-2">
                <div className="text-xs text-rose-300">
                  <strong className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block">Instead of saying:</strong>
                  {item.original}
                </div>
                <div className="text-xs text-emerald-300 font-medium">
                  <strong className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block">Suggested Rewrite:</strong>
                  {item.suggested}
                </div>
                <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                  💡 {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Annotated Transcript */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" /> Full Speech Transcript
        </h3>

        <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed max-h-60 overflow-y-auto">
          {session.full_transcript || "Transcript unavailable."}
        </div>
      </div>

      {/* Derivation Modal */}
      <DerivationModal
        isOpen={showDerivationModal}
        onClose={() => setShowDerivationModal(false)}
        derivation={session.score_derivation}
      />
    </div>
  );
};
