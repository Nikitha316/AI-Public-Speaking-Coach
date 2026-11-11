import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      if (!isRecording) {
        // Flatline idle state
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        return;
      }

      // Dynamic animated wave bars
      const barCount = 36;
      const barWidth = width / barCount - 3;
      phase += 0.08;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 3);
        const amp = Math.sin(phase + i * 0.3) * 0.5 + 0.5;
        const barHeight = Math.max(6, amp * (height * 0.7));
        const y = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#6366F1'); // Indigo
        gradient.addColorStop(0.5, '#06B6D4'); // Cyan
        gradient.addColorStop(1, '#10B981'); // Emerald

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isRecording]);

  return (
    <div className="w-full h-16 bg-dark-800/80 rounded-xl border border-slate-800 p-2 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={50}
        className="w-full h-full block"
      />
    </div>
  );
};
