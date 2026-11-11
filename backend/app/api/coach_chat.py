from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, PracticeSession, AICoachMessage
from app.services.ai_feedback import ai_feedback_service

router = APIRouter(prefix="/coach-chat", tags=["coach-chat"])

class ChatMessageRequest(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    user_message: str
    coach_response: str

@router.get("/history")
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(AICoachMessage).filter(
        AICoachMessage.user_id == current_user.id
    ).order_by(AICoachMessage.created_at.asc()).all()
    
    if not messages:
        # Seed friendly greeting
        greeting = AICoachMessage(
            user_id=current_user.id,
            sender="coach",
            message="Hello! I am your AI Public Speaking Coach. Ask me anything about filler words, pace management, introduction hooks, or request a customized practice topic for your next session!"
        )
        db.add(greeting)
        db.commit()
        db.refresh(greeting)
        messages = [greeting]

    return messages


@router.post("", response_model=ChatMessageResponse)
def ask_coach(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_msg_text = req.message.strip()

    # Save user message
    user_msg_obj = AICoachMessage(
        user_id=current_user.id,
        sender="user",
        message=user_msg_text
    )
    db.add(user_msg_obj)
    db.commit()

    # Retrieve historical session stats for context
    sessions = db.query(PracticeSession).filter(
        PracticeSession.user_id == current_user.id
    ).order_by(PracticeSession.created_at.desc()).limit(5).all()

    avg_wpm = 150.0
    avg_fillers = 3
    recent_mode = "presentation"
    if sessions:
        avg_wpm = sum([s.wpm for s in sessions]) / len(sessions)
        avg_fillers = sum([s.filler_count for s in sessions]) / len(sessions)
        recent_mode = sessions[0].mode

    msg_lower = user_msg_text.lower()
    
    # Generate intelligent contextual reply
    if "filler" in msg_lower:
        reply = (
            f"Based on your recent sessions, you average {avg_fillers:.1f} filler words per practice. "
            "To reduce fillers like 'um' or 'like', practice 'swallowing' the filler word: "
            "when you feel a hesitation coming, close your mouth and take a 1-second silent breath. "
            "Silent pauses sound authoritative, whereas filler words undermine your confidence."
        )
    elif "topic" in msg_lower or "practice topic" in msg_lower:
        reply = (
            "Here is a targeted 3-minute practice topic tailored for you:\n\n"
            "🎯 **Topic**: *'Why Remote Collaboration Needs Better Communication Standards'* \n\n"
            "**Structure Challenge**:\n"
            "1. **Hook (30s)**: Start with an engaging statistic or personal anecdote.\n"
            "2. **Body (2 mins)**: Provide 2 clear examples (e.g., asynchronous updates vs live meetings).\n"
            "3. **Conclusion (30s)**: Summarize with one memorable takeaway."
        )
    elif "interview" in msg_lower or "question" in msg_lower:
        reply = (
            "Here is a mock interview question for your practice session:\n\n"
            "💼 **Question**: *'Tell me about a time you had to explain a complex technical problem to a non-technical stakeholder.'*\n\n"
            "**Coach Tip**: Aim for a 2-minute response (~250–300 words). Use the **STAR method** (Situation, Task, Action, Result) and keep your speaking pace steady at ~140 WPM."
        )
    elif "introduction" in msg_lower or "hook" in msg_lower or "opening" in msg_lower:
        reply = (
            "To build a compelling introduction:\n"
            "1. Start with a **Hook** (a bold question, intriguing fact, or short story).\n"
            "2. State your **Topic & Value Proposition** clearly in the first 30 seconds.\n"
            "3. Preview your main agenda points.\n\n"
            "Would you like to try speaking your intro now on the Live Practice screen?"
        )
    elif "conclusion" in msg_lower or "closing" in msg_lower:
        reply = (
            "A powerful conclusion should follow the 3-step closing framework:\n"
            "1. Transition clearly ('To bring everything together...').\n"
            "2. Summarize your top 2 key takeaways in bullet-point clarity.\n"
            "3. End with a memorable Call to Action or concluding thought.\n\n"
            "Avoid fading out with 'So yeah, that's basically it'!"
        )
    else:
        reply = (
            f"Great question! Looking at your latest data ({recent_mode} mode, ~{avg_wpm:.0f} WPM average), "
            "the single most effective technique to elevate your delivery is placing intentional 2-second pauses "
            "between major section transitions. Give it a try in your next live practice session!"
        )

    coach_msg_obj = AICoachMessage(
        user_id=current_user.id,
        sender="coach",
        message=reply
    )
    db.add(coach_msg_obj)
    db.commit()

    return {
        "user_message": user_msg_text,
        "coach_response": reply
    }
