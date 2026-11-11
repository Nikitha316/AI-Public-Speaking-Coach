import asyncio
import json
import time
from typing import Dict, Any, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.speech_analytics import speech_analytics_service
from app.core.config import settings

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/live-coach")
async def live_coach_websocket(websocket: WebSocket):
    await websocket.accept()
    
    start_time = time.time()
    word_history: List[Dict[str, Any]] = []
    accumulated_transcript = ""
    last_word_count = 0
    last_speech_time = time.time()

    custom_fillers = settings.DEFAULT_FILLER_WORDS

    try:
        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            action = data.get("action", "stream")

            if action == "config":
                if data.get("custom_filler_words"):
                    custom_fillers = data.get("custom_filler_words")
                continue

            elif action == "stream":
                text_chunk = data.get("transcript", "").strip()
                speech_time = data.get("timestamp", time.time() - start_time)
                
                if text_chunk:
                    accumulated_transcript = text_chunk
                    words = [w for w in text_chunk.split() if w]
                    current_word_count = len(words)
                    
                    # Pause calculation
                    time_since_last_speech = time.time() - last_speech_time
                    pause_alert = None
                    if time_since_last_speech >= 3.0:
                        pause_alert = {
                            "type": "long_pause",
                            "duration": round(time_since_last_speech, 1),
                            "message": f"Pause detected ({time_since_last_speech:.1f}s). Use silent pauses intentionally or resume sentence."
                        }
                    elif 1.2 <= time_since_last_speech < 3.0 and current_word_count > last_word_count:
                        pause_alert = {
                            "type": "natural_pause",
                            "duration": round(time_since_last_speech, 1),
                            "message": "Good pause — it separated two key ideas!"
                        }

                    last_speech_time = time.time()
                    last_word_count = current_word_count

                    # Instant WPM calculation (over last 10 seconds or full elapsed)
                    elapsed_seconds = max(1.0, speech_time)
                    wpm_instant = round((current_word_count / (elapsed_seconds / 60.0)), 1)

                    # Filler detection
                    speech_analytics_service.filler_words = custom_fillers
                    filler_count, filler_breakdown, filler_occurrences = speech_analytics_service.detect_filler_words(accumulated_transcript)

                    # Dynamic AI Tip Generator
                    mode = data.get("mode", "presentation")
                    mode_ranges = settings.MODE_PACE_RANGES.get(mode, settings.MODE_PACE_RANGES["general"])
                    
                    if wpm_instant > mode_ranges["target_max"] + 15:
                        ai_tip = f"⚡ You are speaking slightly faster ({wpm_instant:.0f} WPM) than your target pace ({mode_ranges['target_min']}-{mode_ranges['target_max']} WPM). Try pausing after completing each idea."
                    elif wpm_instant < mode_ranges["target_min"] - 15 and wpm_instant > 0:
                        ai_tip = f"🐢 Your speaking pace ({wpm_instant:.0f} WPM) is a bit slow. Increase energy slightly."
                    elif filler_count > 4:
                        top_filler = max(filler_breakdown.items(), key=lambda x: x[1])[0] if filler_breakdown else "um"
                        ai_tip = f"🟡 You used '{top_filler}' {filler_breakdown.get(top_filler, 1)} times. Replace verbal fillers with silent breaths."
                    else:
                        ai_tip = "🟢 Excellent pace and clarity! Keep going."

                    response_packet = {
                        "status": "active",
                        "wpm_instant": wpm_instant,
                        "total_words": current_word_count,
                        "filler_count": filler_count,
                        "filler_breakdown": filler_breakdown,
                        "pause_alert": pause_alert,
                        "clarity_instant": min(98.0, max(60.0, 85.0 - (filler_count * 2.5))),
                        "ai_tip": ai_tip,
                        "elapsed_seconds": round(elapsed_seconds, 1)
                    }

                    await websocket.send_text(json.dumps(response_packet))

    except WebSocketDisconnect:
        print("[WebSocket] Client disconnected from live-coach stream.")
    except Exception as e:
        print(f"[WebSocket Error] {e}")
