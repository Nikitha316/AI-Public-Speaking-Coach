import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Eye, UserCheck, Shield } from 'lucide-react';

interface WebcamPreviewProps {
  enabled: boolean;
  onToggle: () => void;
  cameraEngagement?: number;
  postureStability?: number;
}

export const WebcamPreview: React.FC<WebcamPreviewProps> = ({
  enabled,
  onToggle,
  cameraEngagement = 82,
  postureStability = 85,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (enabled) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setStreamActive(true);
        })
        .catch((err) => {
          console.warn('[Webcam] Access denied or unequipped:', err);
          setStreamActive(false);
        });
    } else {
      setStreamActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [enabled]);

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-between min-h-[220px]">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Camera className="w-4 h-4 text-brand-500" />
          Camera Delivery Preview
        </div>
        <button
          onClick={onToggle}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            enabled
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {enabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
          {enabled ? 'Webcam Active' : 'Enable Webcam'}
        </button>
      </div>

      {/* Video / Preview Container */}
      <div className="w-full h-36 bg-dark-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-800">
        {enabled && streamActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-xl"
          />
        ) : enabled && !streamActive ? (
          <div className="text-center p-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Camera className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-300">Initializing Camera Stream...</p>
            <p className="text-[10px] text-slate-500 mt-0.5">(Camera engagement telemetry ready)</p>
          </div>
        ) : (
          <div className="text-center p-3">
            <Shield className="w-8 h-8 text-slate-600 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400 font-medium">Microphone-Only Mode Active</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Webcam is optional. Complete presentation coaching runs seamlessly via microphone.
            </p>
          </div>
        )}

        {/* Live Delivery Telemetry Overlay */}
        {enabled && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-dark-900/80 backdrop-blur border border-slate-700/50 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Eye className="w-3.5 h-3.5 text-brand-cyan" />
              Camera Attention: <span className="text-emerald-400 font-bold">{cameraEngagement}%</span>
            </span>
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-brand-500" />
              Posture: <span className="text-indigo-400 font-bold">{postureStability}%</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
