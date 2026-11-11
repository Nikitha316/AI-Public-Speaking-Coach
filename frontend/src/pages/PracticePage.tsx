import React, { useState } from 'react';
import { 
  PlayCircle, 
  Presentation, 
  Briefcase, 
  Rocket, 
  GraduationCap, 
  Mic, 
  Clock, 
  Video, 
  Sparkles,
  Sliders,
  Zap
} from 'lucide-react';
import { SpeakingMode } from '../types';

interface PracticePageProps {
  onStartSession: (config: {
    mode: SpeakingMode;
    targetDuration: number;
    topic: string;
    webcamEnabled: boolean;
    customFillers: string[];
    isDemoMode: boolean;
  }) => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({ onStartSession }) => {
  const [mode, setMode] = useState<SpeakingMode>('presentation');
  const [targetDuration, setTargetDuration] = useState<number>(300); // 5 mins
  const [topic, setTopic] = useState<string>('');
  const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false);
  const [fillersInput, setFillersInput] = useState<string>('um, uh, like, basically, actually, you know, so');

  const modeCards: Array<{
    id: SpeakingMode;
    title: string;
    desc: string;
    icon: any;
    targetWpm: string;
  }> = [
    {
      id: 'presentation',
      title: 'Presentation Mode',
      desc: 'Focus on structure, logical flow, transition markers, and steady 140–160 WPM pace.',
      icon: Presentation,
      targetWpm: '130–160 WPM',
    },
    {
      id: 'interview',
      title: 'Interview Mode',
      desc: 'Focus on concise responses, eliminating hesitation, and STAR answer structure.',
      icon: Briefcase,
      targetWpm: '120–150 WPM',
    },
    {
      id: 'elevator_pitch',
      title: 'Elevator Pitch',
      desc: 'High-energy 1–2 minute hook, value proposition, and crisp call to action.',
      icon: Rocket,
      targetWpm: '145–175 WPM',
    },
    {
      id: 'classroom',
      title: 'Classroom Explanation',
      desc: 'Clear concept breakdowns, deliberate pauses, and example usage.',
      icon: GraduationCap,
      targetWpm: '110–140 WPM',
    },
    {
      id: 'general',
      title: 'General Public Speaking',
      desc: 'Balanced vocal control, filler word minimization, and engagement metrics.',
      icon: Mic,
      targetWpm: '130–160 WPM',
    },
  ];

  const durationOptions = [
    { label: '1 Minute', seconds: 60 },
    { label: '3 Minutes', seconds: 180 },
    { label: '5 Minutes', seconds: 300 },
    { label: '10 Minutes', seconds: 600 },
    { label: '15 Minutes', seconds: 900 },
  ];

  const handleLaunch = (isDemoMode: boolean = false) => {
    const customFillers = fillersInput
      .split(',')
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0);

    onStartSession({
      mode,
      targetDuration,
      topic,
      webcamEnabled,
      customFillers,
      isDemoMode,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Configure Your Practice Session</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Choose your coaching mode, duration, and optional topic to receive real-time streaming feedback.
        </p>
      </div>

      {/* 1. Coaching Mode Selection */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-500" /> 1. Select Coaching Mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modeCards.map((card) => {
            const Icon = card.icon;
            const isSelected = mode === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setMode(card.id)}
                className={`glass-card rounded-2xl p-5 border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-500/10 shadow-lg glow-indigo'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-brand-400 border border-slate-700">
                    {card.targetWpm}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Target Presentation Timer */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-cyan" /> 2. Set Target Time Limit
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {durationOptions.map((opt) => {
            const isSelected = targetDuration === opt.seconds;
            return (
              <button
                key={opt.seconds}
                onClick={() => setTargetDuration(opt.seconds)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-brand-500 text-white border-brand-400 shadow-md'
                    : 'bg-dark-800 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Presentation Topic & Optional Setup */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> 3. Topic & Custom Filler Words
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Presentation Topic or Question (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Machine Learning in Healthcare, STAR Interview Question..."
              className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Entering a topic allows the AI to evaluate your opening hook, main body evidence, and conclusion alignment.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Configurable Filler Words List (Comma separated)
            </label>
            <input
              type="text"
              value={fillersInput}
              onChange={(e) => setFillersInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-sm text-amber-300 font-mono focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Webcam Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Enable Webcam Telemetry Analysis</div>
                <div className="text-[11px] text-slate-400">
                  Measures camera visual attention & posture stability. Completely optional.
                </div>
              </div>
            </div>

            <button
              onClick={() => setWebcamEnabled(!webcamEnabled)}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                webcamEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={() => handleLaunch(false)}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl glow-indigo hover:scale-105 transition-all flex items-center justify-center gap-3"
        >
          <PlayCircle className="w-6 h-6 animate-pulse" />
          Start Practice Session
        </button>

        <button
          onClick={() => handleLaunch(true)}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-dark-800 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 text-emerald-400" />
          Instant Evaluator Demo Stream
        </button>
      </div>
    </div>
  );
};
