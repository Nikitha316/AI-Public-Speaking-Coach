from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, PracticeSession, PracticePlan

router = APIRouter(prefix="/plan", tags=["plan"])

class ToggleTaskRequest(BaseModel):
    day: int

@router.get("")
def get_or_generate_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(PracticePlan).filter(
        PracticePlan.user_id == current_user.id,
        PracticePlan.is_active == True
    ).first()

    if not plan:
        # Generate fresh adaptive plan based on recent sessions
        recent_sessions = db.query(PracticeSession).filter(
            PracticeSession.user_id == current_user.id
        ).order_by(PracticeSession.created_at.desc()).limit(3).all()

        schedule = _generate_adaptive_schedule(recent_sessions)
        plan = PracticePlan(
            user_id=current_user.id,
            title="7-Day Targeted Public Speaking Plan",
            duration_days=7,
            current_day=1,
            schedule=schedule
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

    return plan


@router.post("/regenerate")
def regenerate_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(PracticePlan).filter(
        PracticePlan.user_id == current_user.id,
        PracticePlan.is_active == True
    ).all()
    for p in existing:
        p.is_active = False

    recent_sessions = db.query(PracticeSession).filter(
        PracticeSession.user_id == current_user.id
    ).order_by(PracticeSession.created_at.desc()).limit(3).all()

    schedule = _generate_adaptive_schedule(recent_sessions)
    new_plan = PracticePlan(
        user_id=current_user.id,
        title="Adaptive 7-Day Speaking Mastery Plan",
        duration_days=7,
        current_day=1,
        schedule=schedule
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan


@router.post("/toggle-day")
def toggle_day_task(
    req: ToggleTaskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(PracticePlan).filter(
        PracticePlan.user_id == current_user.id,
        PracticePlan.is_active == True
    ).first()

    if not plan:
        return {"error": "No active plan found"}

    schedule = list(plan.schedule)
    for day_item in schedule:
        if day_item.get("day") == req.day:
            day_item["completed"] = not day_item.get("completed", False)
            break

    plan.schedule = schedule
    db.commit()
    db.refresh(plan)
    return plan


def _generate_adaptive_schedule(recent_sessions: List[PracticeSession]) -> List[Dict[str, Any]]:
    # Evaluate primary weakness from historical metrics
    avg_wpm = 150.0
    avg_fillers = 4
    avg_structure = 80.0

    if recent_sessions:
        avg_wpm = sum([s.wpm for s in recent_sessions]) / len(recent_sessions)
        avg_fillers = sum([s.filler_count for s in recent_sessions]) / len(recent_sessions)
        avg_structure = sum([s.structure_score for s in recent_sessions]) / len(recent_sessions)

    primary_focus = "General Delivery"
    if avg_wpm > 170:
        primary_focus = "Pace Control & Slowing Down"
    elif avg_fillers >= 6:
        primary_focus = "Filler Word Reduction"
    elif avg_structure < 75:
        primary_focus = "Presentation Structure & Hooks"

    schedule = [
        {
            "day": 1,
            "title": "Day 1: Baseline Pace & Breathing Drill",
            "focus": "Speaking Pace",
            "task": f"Practice speaking at 140–160 WPM for 3 minutes. Focus on {primary_focus}.",
            "completed": True
        },
        {
            "day": 2,
            "title": "Day 2: Silent Pause Challenge",
            "focus": "Filler Word Reduction",
            "task": "Give a 3-minute presentation. Whenever you feel like saying 'um' or 'like', swallow the word and pause for 2 full seconds.",
            "completed": False
        },
        {
            "day": 3,
            "title": "Day 3: Intentional Rhetorical Pauses",
            "focus": "Pause Quality",
            "task": "Practice placing a distinct 2-second rhetorical pause immediately after stating key conclusions or major points.",
            "completed": False
        },
        {
            "day": 4,
            "title": "Day 4: Hook & Topic Statement Drill",
            "focus": "Opening & Structure",
            "task": "Deliver 3 different 60-second introduction hooks for your topic without reading from written notes.",
            "completed": False
        },
        {
            "day": 5,
            "title": "Day 5: Seamless Section Transitions",
            "focus": "Body & Flow",
            "task": "Practice explicit transition phrases ('First', 'Furthermore', 'Consequently') to link your 3 core sub-topics.",
            "completed": False
        },
        {
            "day": 6,
            "title": "Day 6: High-Impact Closing Drill",
            "focus": "Conclusion",
            "task": "Deliver a 4-minute presentation ensuring your final 45 seconds summarize key takeaways and end on a crisp call to action.",
            "completed": False
        },
        {
            "day": 7,
            "title": "Day 7: Full 5-Minute Final Simulation",
            "focus": "Comprehensive Mastery",
            "task": "Complete a full 5-minute practice session aiming for an overall AI score of 85+ with under 5 total filler words.",
            "completed": False
        }
    ]
    return schedule
