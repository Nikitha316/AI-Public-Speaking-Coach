# 🎤 SPEAKER.AI — Full-Stack AI Public Speaking Coach

Production-grade, real-time interactive **AI Public Speaking Coach** application that analyzes spoken presentations live and delivers multi-metric feedback, mathematical score derivations, structure evaluation, longitudinal progress analytics, side-by-side session comparisons, and personalized 7/14-day practice plans.

---

## 🌟 Key Features

1. **Real-Time Speaking Coach Dashboard**:
   - Live speech recognition streaming via WebSockets.
   - Dynamic HTML5 Canvas audio waveform visualizer.
   - Real-time Words Per Minute (WPM) gauge adjusted by coaching mode (*Presentation, Interview, Elevator Pitch, Classroom, General*).
   - Live filler word counter with configurable word list (`um`, `uh`, `like`, `basically`, `actually`, `you know`, `so`).
   - Pause quality tracker distinguishing natural rhetorical pauses from long awkward hesitations.
   - Live streaming AI Coach advice bubbles.
   - Optional webcam telemetry (camera visual attention % & posture stability %).

2. **Deterministic Score Derivation**:
   - Math formula-backed composite AI Score (0–100) derived from 8 explicit metric sub-scores:
     $$\text{Overall Score} = 0.20 S_{\text{pace}} + 0.15 S_{\text{filler}} + 0.15 S_{\text{pause}} + 0.15 S_{\text{clarity}} + 0.15 S_{\text{structure}} + 0.10 S_{\text{vocab}} + 0.05 S_{\text{time}} + 0.05 S_{\text{delivery}}$$
   - Modal popup showing exact mathematical step-by-step derivation.

3. **Presentation Structure Analysis**:
   - Evaluates opening hook, main body progression & transition markers, and concluding summary statements.

4. **AI Qualitative Critique**:
   - Evidence-backed strengths & areas for improvement.
   - Sentence-by-sentence clarity rewrite suggestions.
   - Automatic offline rule-based NLP fallback engine if OpenAI API key is missing.

5. **Side-by-Side Session Comparison**:
   - Compare any two practice sessions with delta metric growth ($\Delta$ Score, $\Delta$ WPM, $\Delta$ Fillers, $\Delta$ Structure) and AI comparative explanation.

6. **Personalized 7/14-Day Practice Plan**:
   - Adaptive daily drills tailored to previous session weaknesses with interactive task completion tracking.

7. **AI Practice Assistant Chat**:
   - Conversational chat assistant pre-loaded with user performance stats for custom practice prompts and mock interview questions.

8. **Instant Evaluator Demo Mode**:
   - One-click instant simulation stream allowing immediate testing without microphone configuration or API keys.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run pytest unit tests
python -m pytest tests

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 🔒 Voice Privacy & Security

- **Zero Audio Retention**: Audio streams are processed transiently in volatile RAM and never recorded or saved to disc.
- **Explicit User Permissions**: Microphone and webcam access require explicit permission.
- **Data Erasure**: "Delete Session Data" option available on every report screen.
