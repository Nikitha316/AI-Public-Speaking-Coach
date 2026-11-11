import re
from typing import List, Dict, Any, Tuple
from app.core.config import settings

class SpeechAnalyticsService:
    def __init__(self, custom_filler_words: List[str] = None):
        self.filler_words = custom_filler_words or settings.DEFAULT_FILLER_WORDS

    def calculate_wpm(self, word_count: int, duration_seconds: float) -> float:
        if duration_seconds <= 0 or word_count <= 0:
            return 0.0
        minutes = duration_seconds / 60.0
        return round(word_count / minutes, 1)

    def detect_filler_words(self, text: str) -> Tuple[int, Dict[str, int], List[Dict[str, Any]]]:
        if not text:
            return 0, {}, []
        
        lowered = text.lower()
        total_fillers = 0
        breakdown: Dict[str, int] = {}
        occurrences: List[Dict[str, Any]] = []

        # Sort filler words by length descending so multi-word fillers like "you know" are matched first
        sorted_fillers = sorted(self.filler_words, key=lambda x: len(x), reverse=True)

        for filler in sorted_fillers:
            # Pattern with word boundaries
            pattern = r'\b' + re.escape(filler) + r'\b'
            matches = list(re.finditer(pattern, lowered))
            count = len(matches)
            if count > 0:
                breakdown[filler] = count
                total_fillers += count
                for m in matches:
                    occurrences.append({
                        "word": filler,
                        "start_char": m.start(),
                        "end_char": m.end()
                    })

        return total_fillers, breakdown, occurrences

    def analyze_pauses(self, pause_events: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        pause_events: list of {"duration": float, "is_between_sentences": bool}
        """
        if not pause_events:
            return {
                "total_pauses": 0,
                "natural_pauses": 0,
                "long_pauses": 0,
                "avg_duration": 0.0,
                "pause_score": 85.0
            }

        total_pauses = len(pause_events)
        durations = [p.get("duration", 0.0) for p in pause_events]
        avg_duration = round(sum(durations) / total_pauses, 2) if total_pauses > 0 else 0.0

        natural_pauses = 0
        long_pauses = 0

        for p in pause_events:
            dur = p.get("duration", 0.0)
            is_between = p.get("is_between_sentences", True)
            if dur >= 3.0 or (dur >= 2.0 and not is_between):
                long_pauses += 1
            else:
                natural_pauses += 1

        # Pause Quality calculation
        # Penalty for excessive long pauses or 0 natural pauses in long speech
        penalty = long_pauses * 12.0
        if total_pauses == 0:
            pause_score = 70.0
        else:
            pause_score = max(30.0, min(100.0, 100.0 - penalty))

        return {
            "total_pauses": total_pauses,
            "natural_pauses": natural_pauses,
            "long_pauses": long_pauses,
            "avg_duration": avg_duration,
            "pause_score": round(pause_score, 1)
        }

    def detect_word_repetitions(self, text: str) -> List[str]:
        if not text:
            return []
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        repetitions = []
        for i in range(len(words) - 1):
            if words[i] == words[i+1] and len(words[i]) > 2:
                repetitions.append(words[i])
        return list(set(repetitions))

    def calculate_vocabulary_diversity(self, text: str) -> float:
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        if not words:
            return 0.0
        unique_words = set(words)
        # Type-Token Ratio
        ttr = len(unique_words) / len(words)
        return round(ttr * 100, 1)

    def analyze_minute_trends(self, timestamps_words: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Grouping speech into minute chunks to track WPM and filler word trend over time.
        """
        minute_chunks: Dict[int, Dict[str, Any]] = {}
        
        for item in timestamps_words:
            t = item.get("time", 0.0)
            minute = int(t // 60) + 1
            if minute not in minute_chunks:
                minute_chunks[minute] = {"minute": minute, "word_count": 0, "fillers": 0}
            
            minute_chunks[minute]["word_count"] += item.get("word_count", 1)
            minute_chunks[minute]["fillers"] += item.get("fillers", 0)

        results = []
        for min_idx in sorted(minute_chunks.keys()):
            data = minute_chunks[min_idx]
            wpm = data["word_count"]  # Words in that 1-minute bucket
            results.append({
                "minute": f"Min {min_idx}",
                "wpm": wpm,
                "fillers": data["fillers"]
            })
        return results

speech_analytics_service = SpeechAnalyticsService()
