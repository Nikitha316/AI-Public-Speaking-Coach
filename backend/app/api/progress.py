from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, PracticeSession

router = APIRouter(prefix="/progress", tags=["progress"])

@router.get("")
def get_progress_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(PracticeSession).filter(
        PracticeSession.user_id == current_user.id
    ).order_by(PracticeSession.created_at.asc()).all()

    if not sessions:
        return {
            "total_sessions": 0,
            "avg_overall_score": 0.0,
            "score_history": [],
            "filler_reduction_pct": 0.0,
            "wpm_history": [],
            "summary_highlight": "No practice sessions recorded yet. Complete your first session to unlock analytics!"
        }

    total_sessions = len(sessions)
    scores = [s.overall_score for s in sessions if s.overall_score > 0]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    score_history = []
    wpm_history = []
    filler_history = []

    for idx, s in enumerate(sessions, 1):
        score_history.append({
            "session_num": f"Session {idx}",
            "title": s.title or f"Session {idx}",
            "date": s.created_at.strftime("%b %d"),
            "score": s.overall_score,
            "pace": s.pace_score,
            "filler": s.filler_score,
            "structure": s.structure_score
        })
        wpm_history.append({
            "session_num": f"Session {idx}",
            "wpm": s.wpm,
            "target": 150.0
        })
        filler_history.append({
            "session_num": f"Session {idx}",
            "fillers": s.filler_count
        })

    # Filler reduction percentage calculation (first vs recent average)
    if total_sessions >= 2:
        first_fillers = sessions[0].filler_count
        recent_fillers = sum([s.filler_count for s in sessions[-3:]]) / min(3, total_sessions)
        if first_fillers > 0:
            reduction_pct = round(((first_fillers - recent_fillers) / first_fillers) * 100.0, 1)
        else:
            reduction_pct = 0.0
    else:
        reduction_pct = 0.0

    # Summary highlight headline
    if reduction_pct > 0:
        highlight = f"Your filler words decreased by {reduction_pct}% over your recent sessions!"
    elif total_sessions >= 2 and score_history[-1]["score"] > score_history[0]["score"]:
        diff = round(score_history[-1]["score"] - score_history[0]["score"], 1)
        highlight = f"Your presentation score improved by +{diff} points since your first session!"
    else:
        highlight = f"Great job building consistency! You have completed {total_sessions} speaking practice sessions."

    return {
        "total_sessions": total_sessions,
        "avg_overall_score": avg_score,
        "score_history": score_history,
        "wpm_history": wpm_history,
        "filler_history": filler_history,
        "filler_reduction_pct": reduction_pct,
        "summary_highlight": highlight
    }
