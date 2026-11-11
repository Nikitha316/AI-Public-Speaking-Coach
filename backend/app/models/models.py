from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    target_role = Column(String, default="Professional")
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("PracticeSession", back_populates="user", cascade="all, delete-orphan")
    plans = relationship("PracticePlan", back_populates="user", cascade="all, delete-orphan")


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="Speaking Practice")
    mode = Column(String, default="presentation")  # presentation, interview, elevator_pitch, classroom, general
    target_duration_seconds = Column(Integer, default=300)
    actual_duration_seconds = Column(Float, default=0.0)
    topic = Column(String, nullable=True)

    # Core scores (0-100)
    overall_score = Column(Float, default=0.0)
    pace_score = Column(Float, default=0.0)
    clarity_score = Column(Float, default=0.0)
    filler_score = Column(Float, default=0.0)
    pause_score = Column(Float, default=0.0)
    structure_score = Column(Float, default=0.0)
    vocabulary_score = Column(Float, default=0.0)
    time_score = Column(Float, default=0.0)
    delivery_score = Column(Float, default=0.0)

    # Extracted quantitative speech metrics
    wpm = Column(Float, default=0.0)
    total_words = Column(Integer, default=0)
    filler_count = Column(Integer, default=0)
    filler_breakdown = Column(JSON, default=dict)
    pause_count = Column(Integer, default=0)
    long_pause_count = Column(Integer, default=0)
    avg_pause_duration = Column(Float, default=0.0)
    camera_engagement = Column(Float, default=0.0)
    posture_stability = Column(Float, default=0.0)

    # Text & Structure
    full_transcript = Column(Text, default="")
    opening_score = Column(Float, default=0.0)
    body_score = Column(Float, default=0.0)
    conclusion_score = Column(Float, default=0.0)

    # Generated Feedback
    strengths = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    clarity_suggestions = Column(JSON, default=list)
    most_important_tip = Column(Text, default="")
    score_derivation = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    metrics_timeline = relationship("SpeechMetric", back_populates="session", cascade="all, delete-orphan")


class SpeechMetric(Base):
    __tablename__ = "speech_metrics"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("practice_sessions.id"), nullable=False)
    timestamp_seconds = Column(Float, nullable=False)
    wpm_instant = Column(Float, default=0.0)
    filler_detected = Column(String, nullable=True)
    pause_duration = Column(Float, nullable=True)
    clarity_instant = Column(Float, default=0.0)
    engagement_instant = Column(Float, default=0.0)
    feedback_tip = Column(String, nullable=True)

    session = relationship("PracticeSession", back_populates="metrics_timeline")


class PracticePlan(Base):
    __tablename__ = "practice_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="7-Day Mastery Plan")
    duration_days = Column(Integer, default=7)
    current_day = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    schedule = Column(JSON, default=list)  # List of daily tasks/drills with completed status
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="plans")


class AICoachMessage(Base):
    __tablename__ = "ai_coach_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender = Column(String, nullable=False)  # "user" or "coach"
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
