from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, PracticeSession, SpeechMetric
from app.services.speech_analytics import speech_analytics_service
from app.services.structure_analyzer import structure_analyzer_service
from app.services.scoring_engine import scoring_engine_service
from app.services.ai_feedback import ai_feedback_service
from app.services.delivery_analyzer import delivery_analyzer_service

router = APIRouter(prefix="/sessions", tags=["sessions"])

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "Practice Session"
    mode: str = "presentation"  # presentation, interview, elevator_pitch, classroom, general
    target_duration_seconds: int = 300
    topic: Optional[str] = ""
    custom_filler_words: Optional[List[str]] = None

class CompleteSessionRequest(BaseModel):
    transcript: str
    actual_duration_seconds: float
    pause_events: Optional[List[Dict[str, Any]]] = None
    telemetry_data: Optional[Dict[str, Any]] = None
    custom_filler_words: Optional[List[str]] = None

@router.post("", status_code=status.HTTP_201_CREATED)
def create_session(
    req: CreateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = PracticeSession(
        user_id=current_user.id,
        title=req.title,
        mode=req.mode,
        target_duration_seconds=req.target_duration_seconds,
        topic=req.topic
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id, "mode": session.mode, "status": "created"}


@router.post("/{session_id}/complete")
def complete_session(
    session_id: int,
    req: CompleteSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(PracticeSession).filter(
        PracticeSession.id == session_id,
        PracticeSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    transcript = req.transcript.strip()
    words = [w for w in transcript.split() if w]
    total_words = len(words)
    actual_duration = max(1.0, req.actual_duration_seconds)

    # 1. Speech Analytics
    if req.custom_filler_words:
        speech_analytics_service.filler_words = req.custom_filler_words
    
    wpm = speech_analytics_service.calculate_wpm(total_words, actual_duration)
    filler_count, filler_breakdown, _ = speech_analytics_service.detect_filler_words(transcript)
    pause_data = speech_analytics_service.analyze_pauses(req.pause_events or [])
    vocab_diversity = speech_analytics_service.calculate_vocabulary_diversity(transcript)

    # 2. Delivery Analysis (Webcam telemetry)
    delivery_data = delivery_analyzer_service.analyze_delivery_frames(req.telemetry_data or {})

    # 3. Structure Analysis
    structure_data = structure_analyzer_service.analyze_structure(transcript, session.topic or "")

    # 4. Multi-metric Scoring Engine
    scores = scoring_engine_service.calculate_scores(
        mode=session.mode,
        wpm=wpm,
        total_words=total_words,
        filler_count=filler_count,
        pause_data=pause_data,
        structure_data=structure_data,
        vocab_diversity=vocab_diversity,
        target_duration_seconds=session.target_duration_seconds,
        actual_duration_seconds=actual_duration,
        delivery_data=delivery_data
    )

    # 5. AI Qualitative Feedback
    metrics_summary = {
        "wpm": wpm,
        "total_words": total_words,
        "filler_count": filler_count,
        "filler_breakdown": filler_breakdown,
        "long_pause_count": pause_data.get("long_pauses", 0)
    }
    feedback = ai_feedback_service.generate_feedback(
        transcript=transcript,
        topic=session.topic or "",
        mode=session.mode,
        metrics=metrics_summary,
        scores=scores
    )

    # Update database record
    session.actual_duration_seconds = round(actual_duration, 1)
    session.full_transcript = transcript
    session.total_words = total_words
    session.wpm = wpm
    session.filler_count = filler_count
    session.filler_breakdown = filler_breakdown
    session.pause_count = pause_data.get("total_pauses", 0)
    session.long_pause_count = pause_data.get("long_pauses", 0)
    session.avg_pause_duration = pause_data.get("avg_duration", 0.0)
    session.camera_engagement = delivery_data.get("camera_engagement", 80.0)
    session.posture_stability = delivery_data.get("posture_stability", 85.0)

    session.overall_score = scores.get("overall_score", 0.0)
    session.pace_score = scores.get("pace_score", 0.0)
    session.clarity_score = scores.get("clarity_score", 0.0)
    session.filler_score = scores.get("filler_score", 0.0)
    session.pause_score = scores.get("pause_score", 0.0)
    session.structure_score = scores.get("structure_score", 0.0)
    session.vocabulary_score = scores.get("vocab_score", 0.0)
    session.time_score = scores.get("time_score", 0.0)
    session.delivery_score = scores.get("delivery_score", 0.0)

    session.opening_score = structure_data.get("opening_score", 0.0)
    session.body_score = structure_data.get("body_score", 0.0)
    session.conclusion_score = structure_data.get("conclusion_score", 0.0)

    session.strengths = feedback.get("strengths", [])
    session.improvements = feedback.get("improvements", [])
    session.clarity_suggestions = feedback.get("clarity_suggestions", [])
    session.most_important_tip = feedback.get("most_important_tip", "")
    session.score_derivation = scores.get("score_derivation", {})

    db.commit()
    db.refresh(session)
    return {"message": "Session completed successfully", "session_id": session.id, "overall_score": session.overall_score}


@router.get("")
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(PracticeSession).filter(
        PracticeSession.user_id == current_user.id
    ).order_by(PracticeSession.created_at.desc()).all()
    return sessions


@router.get("/compare")
def compare_sessions(
    session1_id: int,
    session2_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s1 = db.query(PracticeSession).filter(PracticeSession.id == session1_id, PracticeSession.user_id == current_user.id).first()
    s2 = db.query(PracticeSession).filter(PracticeSession.id == session2_id, PracticeSession.user_id == current_user.id).first()

    if not s1 or not s2:
        raise HTTPException(status_code=404, detail="One or both sessions not found")

    score_diff = round(s2.overall_score - s1.overall_score, 1)
    wpm_diff = round(s2.wpm - s1.wpm, 1)
    filler_diff = s2.filler_count - s1.filler_count
    structure_diff = round(s2.structure_score - s1.structure_score, 1)

    # Explanation generator
    explanation_parts = []
    if score_diff > 0:
        explanation_parts.append(f"Your overall score improved by +{score_diff} points (from {s1.overall_score:.0f} to {s2.overall_score:.0f}).")
    elif score_diff < 0:
        explanation_parts.append(f"Your overall score decreased by {score_diff} points.")
    else:
        explanation_parts.append("Your overall score remained steady.")

    if filler_diff < 0:
        filler_pct = round((abs(filler_diff) / max(1, s1.filler_count)) * 100, 1)
        explanation_parts.append(f"Your filler word usage dropped by {filler_pct}% (from {s1.filler_count} to {s2.filler_count} fillers).")

    if abs(s2.wpm - 150) < abs(s1.wpm - 150):
        explanation_parts.append(f"Your speaking pace moved closer to the ideal 150 WPM benchmark (from {s1.wpm:.0f} WPM to {s2.wpm:.0f} WPM).")

    ai_explanation = " ".join(explanation_parts)

    return {
        "session1": s1,
        "session2": s2,
        "deltas": {
            "score_diff": score_diff,
            "wpm_diff": wpm_diff,
            "filler_diff": filler_diff,
            "structure_diff": structure_diff
        },
        "ai_explanation": ai_explanation
    }


@router.get("/{session_id}")
def get_session_detail(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(PracticeSession).filter(
        PracticeSession.id == session_id,
        PracticeSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(PracticeSession).filter(
        PracticeSession.id == session_id,
        PracticeSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()
    return {"message": f"Session {session_id} deleted successfully for user privacy"}
