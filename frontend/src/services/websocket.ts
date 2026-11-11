export interface LiveCoachPacket {
  status: string;
  wpm_instant: number;
  total_words: number;
  filler_count: number;
  filler_breakdown: Record<string, number>;
  pause_alert?: {
    type: 'long_pause' | 'natural_pause';
    duration: number;
    message: string;
  } | null;
  clarity_instant: number;
  ai_tip: string;
  elapsed_seconds: number;
}

export class LiveCoachWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessageCallback: ((packet: LiveCoachPacket) => void) | null = null;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // In dev Vite proxy redirects /ws to localhost:8000/ws
    this.url = `${protocol}//${host}/ws/live-coach`;
  }

  connect(onMessage: (packet: LiveCoachPacket) => void) {
    this.onMessageCallback = onMessage;
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[LiveCoachWS] Connected to live coach stream');
      };

      this.ws.onmessage = (event) => {
        try {
          const packet: LiveCoachPacket = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(packet);
          }
        } catch (err) {
          console.error('[LiveCoachWS] Error parsing message', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[LiveCoachWS] WebSocket error, fallback to client-side analytics', err);
      };

      this.ws.onclose = () => {
        console.log('[LiveCoachWS] Stream closed');
      };
    } catch (e) {
      console.warn('[LiveCoachWS] Could not connect to backend WebSocket', e);
    }
  }

  sendConfig(customFillerWords: string[]) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'config',
        custom_filler_words: customFillerWords
      }));
    }
  }

  sendFrame(transcript: string, timestamp: number, mode: string = 'presentation') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'stream',
        transcript,
        timestamp,
        mode
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const liveCoachWS = new LiveCoachWebSocket();
