from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api import auth, sessions, progress, plan, coach_chat, websocket
from app.models.models import User, PracticeSession, PracticePlan, AICoachMessage
from app.core.security import get_password_hash
from datetime import datetime, timedelta

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade full-stack AI Public Speaking Coach API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(sessions.router, prefix=settings.API_V1_STR)
app.include_router(progress.router, prefix=settings.API_V1_STR)
app.include_router(plan.router, prefix=settings.API_V1_STR)
app.include_router(coach_chat.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router)

@app.on_event("startup")
def startup_seed():
    """Seed initial demo user and 5 realistic previous practice sessions for instant testing."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@speaker.ai").first()
        if not user:
            user = User(
                email="demo@speaker.ai",
                hashed_password=get_password_hash("demopass123"),
                full_name="Alex Morgan (Demo Speaker)",
                target_role="Professional Speaker"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Seed 5 sample sessions to populate historical progress charts & before/after comparisons
            sample_data = [
                {
                    "title": "Initial Baseline Presentation",
                    "mode": "presentation",
                    "target_duration_seconds": 300,
                    "actual_duration_seconds": 310,
                    "topic": "Machine Learning in Healthcare",
                    "wpm": 194.0,
                    "total_words": 1002,
                    "filler_count": 31,
                    "filler_breakdown": {"um": 14, "like": 10, "basically": 7},
                    "pause_count": 5,
                    "long_pause_count": 8,
                    "overall_score": 62.0,
                    "pace_score": 58.0,
                    "filler_score": 45.0,
                    "pause_score": 55.0,
                    "clarity_score": 64.0,
                    "structure_score": 64.0,
                    "vocabulary_score": 75.0,
                    "time_score": 95.0,
                    "delivery_score": 70.0,
                    "transcript": "Basically, what I am trying to say is that machine learning is like really important for healthcare today. Um, you know, algorithms can analyze scans faster than humans. Like, actually, it saves lives, but um, we need data security.",
                    "days_ago": 10
                },
                {
                    "title": "Interview Round Practice",
                    "mode": "interview",
                    "target_duration_seconds": 180,
                    "actual_duration_seconds": 175,
                    "topic": "System Architecture Design",
                    "wpm": 180.0,
                    "total_words": 525,
                    "filler_count": 22,
                    "filler_breakdown": {"um": 10, "like": 8, "so": 4},
                    "pause_count": 6,
                    "long_pause_count": 5,
                    "overall_score": 68.0,
                    "pace_score": 65.0,
                    "filler_score": 58.0,
                    "pause_score": 66.0,
                    "clarity_score": 70.0,
                    "structure_score": 72.0,
                    "vocabulary_score": 78.0,
                    "time_score": 98.0,
                    "delivery_score": 76.0,
                    "transcript": "In my previous role, I designed a microservice architecture. Um, so we separated read and write traffic. Like, it increased throughput by 40%.",
                    "days_ago": 7
                },
                {
                    "title": "Elevator Pitch Practice",
                    "mode": "elevator_pitch",
                    "target_duration_seconds": 120,
                    "actual_duration_seconds": 118,
                    "topic": "AI Speech Analytics Platform",
                    "wpm": 171.0,
                    "total_words": 336,
                    "filler_count": 18,
                    "filler_breakdown": {"um": 8, "actually": 5, "you know": 5},
                    "pause_count": 7,
                    "long_pause_count": 4,
                    "overall_score": 71.0,
                    "pace_score": 72.0,
                    "filler_score": 65.0,
                    "pause_score": 72.0,
                    "clarity_score": 73.0,
                    "structure_score": 76.0,
                    "vocabulary_score": 80.0,
                    "time_score": 99.0,
                    "delivery_score": 78.0,
                    "transcript": "Our platform gives instant real-time feedback to public speakers. You know, it measures pace, filler words, and structure automatically.",
                    "days_ago": 5
                },
                {
                    "title": "Classroom Explanation Drill",
                    "mode": "classroom",
                    "target_duration_seconds": 240,
                    "actual_duration_seconds": 245,
                    "topic": "Gradient Descent Optimization",
                    "wpm": 165.0,
                    "total_words": 673,
                    "filler_count": 16,
                    "filler_breakdown": {"um": 7, "like": 5, "basically": 4},
                    "pause_count": 9,
                    "long_pause_count": 3,
                    "overall_score": 78.0,
                    "pace_score": 80.0,
                    "filler_score": 72.0,
                    "pause_score": 80.0,
                    "clarity_score": 79.0,
                    "structure_score": 82.0,
                    "vocabulary_score": 82.0,
                    "time_score": 96.0,
                    "delivery_score": 81.0,
                    "transcript": "Gradient descent is an optimization algorithm used to minimize loss in neural networks. First, we compute the gradient of the loss function.",
                    "days_ago": 3
                },
                {
                    "title": "Final Keynote Presentation",
                    "mode": "presentation",
                    "target_duration_seconds": 300,
                    "actual_duration_seconds": 298,
                    "topic": "AI in Healthcare Keynote",
                    "wpm": 161.0,
                    "total_words": 800,
                    "filler_count": 14,
                    "filler_breakdown": {"um": 6, "like": 4, "basically": 4},
                    "pause_count": 12,
                    "long_pause_count": 2,
                    "overall_score": 82.0,
                    "pace_score": 86.0,
                    "filler_score": 72.0,
                    "pause_score": 84.0,
                    "clarity_score": 79.0,
                    "structure_score": 88.0,
                    "vocabulary_score": 81.0,
                    "time_score": 98.0,
                    "delivery_score": 85.0,
                    "transcript": "Good morning everyone. Today I will demonstrate how artificial intelligence is reshaping healthcare diagnostics. First, machine learning models analyze medical imagery with high precision. Next, predictive analytics forecast patient recovery rates. In conclusion, combining human clinical expertise with AI delivers faster, safer healthcare.",
                    "days_ago": 1
                }
            ]

            for s in sample_data:
                created = datetime.utcnow() - timedelta(days=s["days_ago"])
                ps = PracticeSession(
                    user_id=user.id,
                    title=s["title"],
                    mode=s["mode"],
                    target_duration_seconds=s["target_duration_seconds"],
                    actual_duration_seconds=s["actual_duration_seconds"],
                    topic=s["topic"],
                    wpm=s["wpm"],
                    total_words=s["total_words"],
                    filler_count=s["filler_count"],
                    filler_breakdown=s["filler_breakdown"],
                    pause_count=s["pause_count"],
                    long_pause_count=s["long_pause_count"],
                    avg_pause_duration=1.4,
                    camera_engagement=78.0 if s["mode"] == "presentation" else 84.0,
                    posture_stability=82.0,
                    full_transcript=s["transcript"],
                    overall_score=s["overall_score"],
                    pace_score=s["pace_score"],
                    filler_score=s["filler_score"],
                    pause_score=s["pause_score"],
                    clarity_score=s["clarity_score"],
                    structure_score=s["structure_score"],
                    vocabulary_score=s["vocabulary_score"],
                    time_score=s["time_score"],
                    delivery_score=s["delivery_score"],
                    opening_score=86.0,
                    body_score=79.0,
                    conclusion_score=88.0,
                    strengths=[
                        "Strong presentation structure with explicit hook and concluding call to action.",
                        "Clear example usage when explaining core technical concepts.",
                        "High camera engagement and steady posture throughout speech."
                    ],
                    improvements=[
                        "Speaking pace reached 194 WPM in early sessions, now stabilized at 161 WPM.",
                        "Slight filler word concentration ('um', 'like') during section transitions.",
                        "Add a silent 2-second pause after stating major thesis points."
                    ],
                    clarity_suggestions=[
                        {
                            "original": '"Basically, what I am trying to say is that machine learning is like really important..."',
                            "suggested": '"Machine learning delivers critical speed and precision to modern medical diagnostics."',
                            "explanation": "Removed filler phrase ('Basically, what I am trying to say') for direct authoritative phrasing."
                        }
                    ],
                    most_important_tip="Focus on replacing verbal fillers during section transitions with intentional silent pauses.",
                    score_derivation={
                        "formula": "0.20*Pace + 0.15*Filler + 0.15*Pause + 0.15*Clarity + 0.15*Structure + 0.10*Vocab + 0.05*Time + 0.05*Delivery",
                        "overall_score": s["overall_score"],
                        "sub_scores": {
                            "pace_score": {"score": s["pace_score"], "reason": f"Average pace of {s['wpm']} WPM."},
                            "filler_score": {"score": s["filler_score"], "reason": f"{s['filler_count']} filler words detected."},
                            "pause_score": {"score": s["pause_score"], "reason": f"{s['pause_count']} natural pauses."},
                            "clarity_score": {"score": s["clarity_score"], "reason": "High vocabulary diversity and sentence length."},
                            "structure_score": {"score": s["structure_score"], "reason": "Clear opening, body, and conclusion."},
                            "vocab_score": {"score": s["vocabulary_score"], "reason": "Good unique word ratio."},
                            "time_score": {"score": s["time_score"], "reason": "Pacing fit target time window."},
                            "delivery_score": {"score": s["delivery_score"], "reason": "Visual attention and posture stability."}
                        }
                    },
                    created_at=created
                )
                db.add(ps)
            
            db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "AI Public Speaking Coach API is running",
        "docs": "/docs",
        "version": "1.0.0"
    }
