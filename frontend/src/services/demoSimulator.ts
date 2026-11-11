export interface DemoScriptStep {
  timeSeconds: number;
  addedText: string;
  wpm: number;
  pauseAlert?: { type: 'long_pause' | 'natural_pause'; duration: number; message: string };
  aiTip: string;
}

export const DEMO_SCRIPT_STEPS: DemoScriptStep[] = [
  {
    timeSeconds: 3,
    addedText: "Good morning everyone. Today I am excited to present our findings on Machine Learning in modern healthcare.",
    wpm: 140,
    aiTip: "🟢 Great starting pace and clear introduction hook!"
  },
  {
    timeSeconds: 8,
    addedText: " Basically, what we are seeing is that AI models can process medical imaging like MRI scans faster than traditional workflows.",
    wpm: 185,
    aiTip: "⚡ You are speaking slightly faster than target pace (185 WPM). Try pausing after completing each idea."
  },
  {
    timeSeconds: 14,
    addedText: " Um, you know, when doctors analyze these scans manually, it takes hours.",
    wpm: 160,
    aiTip: "🟡 You used 'um' and 'you know'. Try replacing verbal crutches with silent breaths."
  },
  {
    timeSeconds: 20,
    addedText: " ... ",
    wpm: 130,
    pauseAlert: {
      type: "natural_pause",
      duration: 2.1,
      message: "Good pause — it separated two important ideas!"
    },
    aiTip: "🟢 Excellent 2-second rhetorical pause after your key point."
  },
  {
    timeSeconds: 27,
    addedText: " Next, let us examine the predictive analytics module. Like, actually, it forecasts patient recovery rates with 92% accuracy.",
    wpm: 165,
    aiTip: "💡 Remember to maintain crisp transition markers between points."
  },
  {
    timeSeconds: 35,
    addedText: " In conclusion, combining human clinical expertise with artificial intelligence delivers faster, safer healthcare for everyone. Thank you.",
    wpm: 148,
    aiTip: "🟢 Strong summarizing conclusion and clear final statement!"
  }
];

export class DemoSimulatorEngine {
  private timer: any = null;
  private currentStepIndex: number = 0;
  private currentTranscript: string = '';
  private onUpdateCallback: ((transcript: string, step: DemoScriptStep, isFinished: boolean) => void) | null = null;

  start(onUpdate: (transcript: string, step: DemoScriptStep, isFinished: boolean) => void) {
    this.stop();
    this.currentStepIndex = 0;
    this.currentTranscript = '';
    this.onUpdateCallback = onUpdate;

    this.timer = setInterval(() => {
      if (this.currentStepIndex < DEMO_SCRIPT_STEPS.length) {
        const step = DEMO_SCRIPT_STEPS[this.currentStepIndex];
        if (step.addedText !== " ... ") {
          this.currentTranscript += (this.currentTranscript ? " " : "") + step.addedText;
        }
        
        const isFinished = this.currentStepIndex === DEMO_SCRIPT_STEPS.length - 1;
        if (this.onUpdateCallback) {
          this.onUpdateCallback(this.currentTranscript, step, isFinished);
        }
        this.currentStepIndex++;
      } else {
        this.stop();
      }
    }, 4000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const demoSimulatorEngine = new DemoSimulatorEngine();
