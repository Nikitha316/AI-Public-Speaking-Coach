export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private fullTranscript: string = '';
  private onTranscriptUpdate: ((transcript: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalSegment = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSegment += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalSegment) {
          this.fullTranscript += finalSegment;
        }

        const combined = (this.fullTranscript + ' ' + currentInterim).trim();
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(combined);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[SpeechRecognition] Error:', event.error);
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
      };

      this.recognition.onend = () => {
        // Automatically restart if session is supposed to be active
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started or terminated
          }
        }
      };
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  start(onTranscript: (text: string) => void, onError?: (err: string) => void) {
    this.fullTranscript = '';
    this.onTranscriptUpdate = onTranscript;
    this.onErrorCallback = onError || null;
    this.isListening = true;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('[SpeechRecognition] Could not start speech recognition:', e);
      }
    }
  }

  stop(): string {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    return this.fullTranscript.trim();
  }

  getTranscript(): string {
    return this.fullTranscript.trim();
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
