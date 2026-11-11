export type SpeakingMode = 'presentation' | 'interview' | 'elevator_pitch' | 'classroom' | 'general';

export interface User {
  id: number;
  email: string;
  full_name: string;
  target_role: string;
}

export interface MetricSubScore {
  score: number;
  reason: string;
}

export interface ScoreDerivation {
  formula: string;
  overall_score: number;
  weights: Record<string, number>;
  sub_scores: {
    pace_score: MetricSubScore;
    filler_score: MetricSubScore;
    pause_score: MetricSubScore;
    clarity_score: MetricSubScore;
    structure_score: MetricSubScore;
    vocab_score: MetricSubScore;
    time_score: MetricSubScore;
    delivery_score: MetricSubScore;
  };
}

export interface PracticeSession {
  id: number;
  title: string;
  mode: SpeakingMode;
  target_duration_seconds: number;
  actual_duration_seconds: number;
  topic: string;
  
  overall_score: number;
  pace_score: number;
  clarity_score: number;
  filler_score: number;
  pause_score: number;
  structure_score: number;
  vocabulary_score: number;
  time_score: number;
  delivery_score: number;

  wpm: number;
  total_words: number;
  filler_count: number;
  filler_breakdown: Record<string, number>;
  pause_count: number;
  long_pause_count: number;
  avg_pause_duration: number;
  camera_engagement: number;
  posture_stability: number;

  full_transcript: string;
  opening_score: number;
  body_score: number;
  conclusion_score: number;

  strengths: string[];
  improvements: string[];
  clarity_suggestions: Array<{ original: string; suggested: string; explanation: string }>;
  most_important_tip: string;
  score_derivation: ScoreDerivation;

  created_at: string;
}

export interface CompareResult {
  session1: PracticeSession;
  session2: PracticeSession;
  deltas: {
    score_diff: number;
    wpm_diff: number;
    filler_diff: number;
    structure_diff: number;
  };
  ai_explanation: string;
}

export interface PracticePlanItem {
  day: number;
  title: string;
  focus: string;
  task: string;
  completed: boolean;
}

export interface PracticePlan {
  id: number;
  title: string;
  duration_days: number;
  current_day: number;
  is_active: boolean;
  schedule: PracticePlanItem[];
}

export interface ChatMessage {
  id?: number;
  sender: 'user' | 'coach';
  message: string;
  created_at?: string;
}
