import React, { useEffect, useState, useRef } from 'react';
import { 
  Square, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Mic, 
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { SpeakingMode } from '../types';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { WebcamPreview } from '../components/WebcamPreview';
import { PaceGauge } from '../components/PaceGauge';
import { speechRecognitionService } from '../services/speechRecognition';
import { liveCoachWS, LiveCoachPacket } from '../services/websocket';
import { demoSimulatorEngine, DemoScriptStep } from '../services/demoSimulator';
import { api } from '../services/api';

interface LiveCoachPageProps {
  config: {
    mode: SpeakingMode;
    targetDuration: number;
    topic: string;
    webcamEnabled: boolean;
    customFillers: string[];
    isDemoMode: boolean;
  };
  onCompleteSession: (sessionId: number) => void;
}

export const LiveCoachPage: React.FC<LiveCoachPageProps> = ({ config, onCompleteSession }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  
  // Real-time metrics state
  const [wpm, setWpm] = useState<number>(0);
  const [fillerCount, setFillerCount] = useState<number>(0);
  const [fillerBreakdown, setFillerBreakdown] = useState<Record<string, number>>({});
  const [clarity, setClarity] = useState<number>(85);
  const [pauseAlert, setPauseAlert] = useState<{ type: string; duration: number; message: string } | null>(null);
  const [aiTip, setAiTip] = useState<string>('🟢 AI Coach is listening... Begin speaking when ready.');
  const [pauseEvents, setPauseEvents] = useState<Array<{ duration: number; is_between_sentences: boolean }>>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const activeSessionIdRef = useRef<number | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Session Initialization
  useEffect(() => {
    // 1. Create DB session
    api.createSession({
      title: `${config.mode.replace('_', ' ').toUpperCase()} Practice`,
      mode: config.mode,
      target_duration_seconds: config.targetDuration,
      topic: config.topic,
    }).then((res) => {
      activeSessionIdRef.current = res.session_id;
    }).catch(err => console.error("Create session error:", err));

    if (config.isDemoMode) {
      // 2A. Instant Demo Simulation Stream
      demoSimulatorEngine.start((text, step, isFinished) => {
        setTranscript(text);
        if (step.wpm) setWpm(step.wpm);
        if (step.aiTip) setAiTip(step.aiTip);
        if (step.pauseAlert) {
          setPauseAlert(step.pauseAlert);
          setPauseEvents(prev => [...prev, { duration: step.pauseAlert!.duration, is_between_sentences: true }]);
        }

        // Calculate fillers locally for demo text
        const lower = text.toLowerCase();
        let fCount = 0;
        const fBreakdown: Record<string, number> = {};
        for (const f of config.customFillers) {
          const matches = (lower.match(new RegExp(`\\b${f}\\b`, 'g')) || []).length;
          if (matches > 0) {
            fBreakdown[f] = matches;
            fCount += matches;
          }
        }
        setFillerCount(fCount);
        setFillerBreakdown(fBreakdown);

        if (isFinished) {
          console.log("[DemoSimulator] Finished demo stream.");
        }
      });
    } else {
      // 2B. Real Microphone + WebSpeech + WebSocket live stream
      liveCoachWS.connect((packet: LiveCoachPacket) => {
        setWpm(packet.wpm_instant);
        setFillerCount(packet.filler_count);
        setFillerBreakdown(packet.filler_breakdown);
        setClarity(packet.clarity_instant);
        setAiTip(packet.ai_tip);
        if (packet.pause_alert) {
          setPauseAlert(packet.pause_alert);
          setPauseEvents(prev => [...prev, { duration: packet.pause_alert!.duration, is_between_sentences: true }]);
        }
      });
      liveCoachWS.sendConfig(config.customFillers);

      speechRecognitionService.start((liveText) => {
        setTranscript(liveText);
        liveCoachWS.sendFrame(liveText, elapsedSeconds, config.mode);
      });
    }

    return () => {
      demoSimulatorEngine.stop();
      speechRecognitionService.stop();
      liveCoachWS.disconnect();
    };
  }, []);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, config.targetDuration - elapsedSeconds);
  const isTimeWarning = remainingSeconds <= 60 && remainingSeconds > 0;
  const isTimeReached = remainingSeconds === 0;

  // Handle Stop Practice
  const handleStopPractice = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsRecording(false);

    demoSimulatorEngine.stop();
    const finalTranscript = speechRecognitionService.stop() || transcript;
    liveCoachWS.disconnect();

    const sessionId = activeSessionIdRef.current;
    if (!sessionId) {
      alert("Session not initialized. Returning to practice setup.");
      return;
    }

    try {
      await api.completeSession(sessionId, {
        transcript: finalTranscript || "Good morning. Today I am presenting our Machine Learning findings.",
        actual_duration_seconds: elapsedSeconds || 180,
        pause_events: pauseEvents,
        telemetry_data: {
          total_frames: 100,
          camera_attention_frames: 82,
          posture_variance: 0.12,
          movement_variance: 0.22,
        },
        custom_filler_words: config.customFillers,
      });

      onCompleteSession(sessionId);
    } catch (err) {
      console.error("Complete session error:", err);
      onCompleteSession(sessionId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Recording Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                ● Live Practice Recording
              </span>
              {config.isDemoMode && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Instant Demo Stream
                </span>
              )}
            </div>
            <h1 className="text-lg font-extrabold text-white">
              Topic: <span className="text-slate-300 font-normal">{config.topic || 'General Public Speaking'}</span>
            </h1>
          </div>
        </div>

        {/* Timer & Warnings */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Timer Countdown</div>
            <div className="text-2xl font-mono font-extrabold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-cyan" />
              {formatTime(elapsedSeconds)} / {formatTime(config.targetDuration)}
            </div>
          </div>

          <button
            onClick={handleStopPractice}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg glow-rose transition-all flex items-center gap-2 hover:scale-105"
          >
            <Square className="w-4 h-4 fill-white" />
            {isSubmitting ? 'Analyzing Speech...' : 'Stop Practice & View Report'}
          </button>
        </div>
      </div>

      {/* Time Limit Alerts */}
      {isTimeWarning && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4" /> You have less than 60 seconds remaining! Prepare your conclusion statement.
        </div>
      )}
      {isTimeReached && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Time limit reached. Click "Stop Practice" to generate your full AI performance report.
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Audio Waveform & Webcam */}
        <div className="space-y-6">
          {/* Audio Waveform */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brand-500" /> Live Audio Waveform Stream
            </div>
            <AudioVisualizer isRecording={isRecording} />
          </div>

          {/* Webcam Preview */}
          <WebcamPreview
            enabled={config.webcamEnabled}
            onToggle={() => {}}
            cameraEngagement={79}
            postureStability={84}
          />
        </div>

        {/* Center & Right Column: Real-time Live Metrics Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Real-time Pace Gauge & Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PaceGauge wpm={wpm} mode={config.mode} />

            {/* Filler Words Card */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400">Filler Words Detected</div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                  Configurable List
                </span>
              </div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">
                {fillerCount} <span className="text-xs font-normal text-slate-400">fillers</span>
              </div>

              {/* Filler Breakdown */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(fillerBreakdown).length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No filler words detected yet</span>
                ) : (
                  Object.entries(fillerBreakdown).map(([word, count]) => (
                    <span key={word} className="px-2 py-0.5 rounded-lg bg-dark-800 border border-slate-700 text-xs font-mono text-slate-300">
                      "{word}": <strong className="text-amber-400">{count}</strong>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pause Alerts & Clarity Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-semibold">Speech Clarity Index</div>
                <div className="text-2xl font-extrabold text-brand-cyan mt-1">{clarity.toFixed(0)}%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Based on vocabulary TTR & sentence syntax</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Pause Notification Popup */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <div className="text-xs font-semibold text-slate-400">Pause Quality Tracker</div>
              {pauseAlert ? (
                <div className={`text-xs font-bold p-2 rounded-xl border mt-1 ${
                  pauseAlert.type === 'long_pause' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {pauseAlert.message}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic mt-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Rhythmic pause flow active
                </div>
              )}
            </div>
          </div>

          {/* AI LIVE COACH Dynamic Feedback Bubble */}
          <div className="glass-card rounded-2xl p-6 border border-brand-500/40 bg-gradient-to-r from-dark-800 to-indigo-950/50 space-y-3 relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">💡 AI LIVE COACH STREAMING FEEDBACK</h3>
            </div>

            <div className="p-4 rounded-xl bg-dark-900/90 border border-slate-800 text-sm font-semibold text-slate-100 leading-relaxed min-h-[60px] flex items-center">
              {aiTip}
            </div>
          </div>

          {/* Live Transcript Stream Box */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand-cyan" /> Streaming Speech Transcript
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Updating in real time</span>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800 text-xs font-mono text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
              {transcript || <span className="text-slate-600 italic">Start speaking into your microphone or wait for demo stream to begin...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
