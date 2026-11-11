import { PracticeSession, CompareResult, PracticePlan, ChatMessage, User } from '../types';

const API_BASE = '/api/v1';

export function getToken(): string {
  return localStorage.getItem('psc_access_token') || 'demo-token';
}

export function setToken(token: string) {
  localStorage.setItem('psc_access_token', token);
}

export function removeToken() {
  localStorage.removeItem('psc_access_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    let msg = `API Error (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) {
        msg = typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
      }
    } catch (e) {
      msg = errorText || msg;
    }
    throw new Error(msg);
  }
  return response.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; full_name?: string; target_role?: string }) =>
    request<{ access_token: string; user_id: number; email: string; full_name: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { username: string; password: string }) => {
    const body = new URLSearchParams();
    body.append('username', data.username);
    body.append('password', data.password);

    return fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }).then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        let msg = 'Incorrect email or password.';
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.detail) msg = parsed.detail;
        } catch (e) {}
        throw new Error(msg);
      }
      return res.json() as Promise<{ access_token: string; user_id: number; email: string; full_name: string }>;
    });
  },

  resetPassword: (data: { email: string; new_password: string }) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/auth/me'),

  // Sessions
  createSession: (data: { title: string; mode: string; target_duration_seconds: number; topic?: string }) =>
    request<{ session_id: number; mode: string }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeSession: (sessionId: number, data: {
    transcript: string;
    actual_duration_seconds: number;
    pause_events?: any[];
    telemetry_data?: any;
    custom_filler_words?: string[];
  }) =>
    request<{ session_id: number; overall_score: number }>(`/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listSessions: () => request<PracticeSession[]>('/sessions'),

  getSessionDetail: (sessionId: number) => request<PracticeSession>(`/sessions/${sessionId}`),

  deleteSession: (sessionId: number) =>
    request<{ message: string }>(`/sessions/${sessionId}`, { method: 'DELETE' }),

  compareSessions: (id1: number, id2: number) =>
    request<CompareResult>(`/sessions/compare?session1_id=${id1}&session2_id=${id2}`),

  // Progress
  getProgress: () => request<any>('/progress'),

  // Practice Plan
  getPlan: () => request<PracticePlan>('/plan'),
  regeneratePlan: () => request<PracticePlan>('/plan/regenerate', { method: 'POST' }),
  togglePlanTask: (day: number) =>
    request<PracticePlan>('/plan/toggle-day', {
      method: 'POST',
      body: JSON.stringify({ day }),
    }),

  // AI Coach Chat
  getChatHistory: () => request<ChatMessage[]>('/coach-chat/history'),
  sendChatMessage: (message: string) =>
    request<{ user_message: string; coach_response: string }>('/coach-chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
