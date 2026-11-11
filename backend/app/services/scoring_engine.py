from typing import Dict, Any
from app.core.config import settings

class ScoringEngineService:
    def calculate_scores(
        self,
        mode: str,
        wpm: float,
        total_words: int,
        filler_count: int,
        pause_data: Dict[str, Any],
        structure_data: Dict[str, Any],
        vocab_diversity: float,
        target_duration_seconds: float,
        actual_duration_seconds: float,
        delivery_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:

        mode_config = settings.MODE_PACE_RANGES.get(mode, settings.MODE_PACE_RANGES["general"])
        target_min = mode_config["target_min"]
        target_max = mode_config["target_max"]
        target_mid = (target_min + target_max) / 2.0

        # 1. Pace Score
        if wpm <= 0:
            pace_score = 50.0
            pace_reason = "No speech detected"
        else:
            diff = abs(wpm - target_mid)
            if target_min <= wpm <= target_max:
                pace_score = 100.0 - (diff * 0.5)
                pace_reason = f"Ideal speaking pace ({wpm:.1f} WPM) for {mode.replace('_', ' ')} mode."
            elif wpm < target_min:
                pace_score = max(30.0, 100.0 - (target_min - wpm) * 2.5)
                pace_reason = f"Speaking slower than target range ({target_min}-{target_max} WPM)."
            else:
                pace_score = max(30.0, 100.0 - (wpm - target_max) * 2.2)
                pace_reason = f"Speaking faster than target range ({target_min}-{target_max} WPM)."
        pace_score = round(pace_score, 1)

        # 2. Filler Control Score
        if total_words <= 0:
            filler_score = 100.0
            filler_ratio = 0.0
            filler_reason = "No filler words used."
        else:
            filler_ratio = (filler_count / total_words) * 100.0
            filler_score = max(20.0, 100.0 - (filler_ratio * 12.0))
            filler_reason = f"Filler density of {filler_ratio:.1f}% ({filler_count} fillers in {total_words} words)."
        filler_score = round(filler_score, 1)

        # 3. Pause Score
        pause_score = float(pause_data.get("pause_score", 80.0))
        long_pauses = pause_data.get("long_pause_count", 0)
        pause_reason = f"Detected {pause_data.get('natural_pauses', 0)} natural pauses and {long_pauses} long awkward pauses."

        # 4. Clarity Score
        # Derived from sentence structure & vocabulary balance
        if total_words > 0:
            clarity_score = min(100.0, max(40.0, 70.0 + (vocab_diversity * 0.2) - (filler_ratio * 3.0)))
        else:
            clarity_score = 60.0
        clarity_score = round(clarity_score, 1)
        clarity_reason = f"Clarity derived from word diversity ({vocab_diversity:.1f}%) and low filler interference."

        # 5. Structure Score
        structure_score = float(structure_data.get("overall_structure_score", 75.0))
        structure_reason = f"Opening: {structure_data.get('opening_score', 0)}, Body: {structure_data.get('body_score', 0)}, Conclusion: {structure_data.get('conclusion_score', 0)}."

        # 6. Vocabulary Score
        vocab_score = min(100.0, max(40.0, vocab_diversity * 1.4))
        vocab_score = round(vocab_score, 1)
        vocab_reason = f"Unique vocabulary ratio of {vocab_diversity:.1f}%."

        # 7. Time Management Score
        if target_duration_seconds <= 0:
            time_score = 90.0
            time_reason = "No target duration set."
        else:
            duration_ratio = actual_duration_seconds / target_duration_seconds
            if 0.85 <= duration_ratio <= 1.15:
                time_score = 100.0
                time_reason = f"Pacing fit presentation time window perfectly ({actual_duration_seconds:.0f}s / {target_duration_seconds:.0f}s)."
            elif duration_ratio < 0.85:
                time_score = max(40.0, 100.0 - (0.85 - duration_ratio) * 120.0)
                time_reason = f"Ended significantly earlier than target duration."
            else:
                time_score = max(40.0, 100.0 - (duration_ratio - 1.15) * 100.0)
                time_reason = f"Exceeded allotted target time."
        time_score = round(time_score, 1)

        # 8. Delivery Score
        if delivery_data:
            delivery_score = float(delivery_data.get("delivery_score", 82.0))
            delivery_reason = f"Camera Engagement: {delivery_data.get('camera_engagement', 80)}%, Posture: {delivery_data.get('posture_stability', 80)}%."
        else:
            delivery_score = 85.0
            delivery_reason = "Microphone mode (webcam optional)."

        # Weighted Overall Score Formula
        overall_score = (
            (pace_score * 0.20) +
            (filler_score * 0.15) +
            (pause_score * 0.15) +
            (clarity_score * 0.15) +
            (structure_score * 0.15) +
            (vocab_score * 0.10) +
            (time_score * 0.05) +
            (delivery_score * 0.05)
        )
        overall_score = round(overall_score, 1)

        # Build transparent mathematical derivation object
        score_derivation = {
            "formula": "0.20*Pace + 0.15*Filler + 0.15*Pause + 0.15*Clarity + 0.15*Structure + 0.10*Vocab + 0.05*Time + 0.05*Delivery",
            "overall_score": overall_score,
            "weights": {
                "pace": 0.20,
                "filler": 0.15,
                "pause": 0.15,
                "clarity": 0.15,
                "structure": 0.15,
                "vocab": 0.10,
                "time": 0.05,
                "delivery": 0.05
            },
            "sub_scores": {
                "pace_score": {"score": pace_score, "reason": pace_reason},
                "filler_score": {"score": filler_score, "reason": filler_reason},
                "pause_score": {"score": pause_score, "reason": pause_reason},
                "clarity_score": {"score": clarity_score, "reason": clarity_reason},
                "structure_score": {"score": structure_score, "reason": structure_reason},
                "vocab_score": {"score": vocab_score, "reason": vocab_reason},
                "time_score": {"score": time_score, "reason": time_reason},
                "delivery_score": {"score": delivery_score, "reason": delivery_reason}
            }
        }

        return {
            "overall_score": overall_score,
            "pace_score": pace_score,
            "filler_score": filler_score,
            "pause_score": pause_score,
            "clarity_score": clarity_score,
            "structure_score": structure_score,
            "vocab_score": vocab_score,
            "time_score": time_score,
            "delivery_score": delivery_score,
            "score_derivation": score_derivation
        }

scoring_engine_service = ScoringEngineService()
