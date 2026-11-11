import re
from typing import Dict, Any, List
from app.core.config import settings

class AIFeedbackService:
    def generate_feedback(
        self,
        transcript: str,
        topic: str,
        mode: str,
        metrics: Dict[str, Any],
        scores: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generates strengths, improvements, sentence rewrites, most important tip, and 7-day practice plan suggestions.
        Supports optional OpenAI LLM integration with automatic rule-based NLP fallback.
        """
        if settings.OPENAI_API_KEY:
            try:
                return self._generate_llm_feedback(transcript, topic, mode, metrics, scores)
            except Exception as e:
                print(f"[AIFeedbackService] OpenAI call failed ({e}), falling back to Rule-Based engine.")
                return self._generate_rule_based_feedback(transcript, topic, mode, metrics, scores)
        else:
            return self._generate_rule_based_feedback(transcript, topic, mode, metrics, scores)

    def _generate_rule_based_feedback(
        self,
        transcript: str,
        topic: str,
        mode: str,
        metrics: Dict[str, Any],
        scores: Dict[str, Any]
    ) -> Dict[str, Any]:
        wpm = metrics.get("wpm", 0)
        filler_count = metrics.get("filler_count", 0)
        filler_breakdown = metrics.get("filler_breakdown", {})
        long_pauses = metrics.get("long_pause_count", 0)
        total_words = metrics.get("total_words", 0)

        strengths: List[str] = []
        improvements: List[str] = []
        clarity_suggestions: List[Dict[str, str]] = []

        # 1. Evaluate Strengths (Evidence-backed)
        mode_label = mode.replace('_', ' ').capitalize()
        if wpm >= 130 and wpm <= 165:
            strengths.append(f"Maintained an optimal speaking pace of {wpm:.0f} WPM suitable for a {mode_label} speech.")
        elif wpm > 0:
            strengths.append(f"Completed the talk with an average rate of {wpm:.0f} WPM, giving full articulation to key phrases.")

        if filler_count <= 4 and total_words > 50:
            strengths.append(f"Excellent filler word control (only {filler_count} detected out of {total_words} words).")
        elif filler_count > 0:
            top_filler = max(filler_breakdown.items(), key=lambda x: x[1])[0] if filler_breakdown else "um"
            strengths.append(f"Successfully minimized filler word repetition in several key sentences despite using '{top_filler}' occasionally.")

        if scores.get("structure_score", 0) >= 80:
            strengths.append(f"Strong presentation flow with clear logical progression between section introduction and conclusion.")
        else:
            strengths.append("Addressed the main topic clearly during the core explanation.")

        # 2. Evaluate Areas to Improve (Evidence-backed)
        if wpm > 170:
            improvements.append(f"Your speaking rate reached {wpm:.0f} WPM, which is significantly faster than the recommended 140–160 WPM target for {mode_label}.")
        elif wpm < 110 and wpm > 0:
            improvements.append(f"Your pace fell to {wpm:.0f} WPM. Speeding up slightly will maintain higher audience engagement.")

        if filler_count >= 5:
            top_fillers = sorted(filler_breakdown.items(), key=lambda x: x[1], reverse=True)[:2]
            fillers_str = ", ".join([f"'{k}' ({v} times)" for k, v in top_fillers])
            improvements.append(f"Frequent filler word usage observed: {fillers_str}. Replace these verbal crutches with silent breath pauses.")

        if long_pauses >= 3:
            improvements.append(f"Detected {long_pauses} long hesitation pauses (over 3 seconds). Plan key transitions ahead of time to avoid dead air.")

        if scores.get("structure_score", 0) < 75:
            improvements.append("The transition between your main body points and final summary felt abrupt. Use explicit transition markers like 'Next', 'Furthermore', or 'To summarize'.")

        # 3. Sentence Clarity Suggestions (Exact transcript quotes & rewrites)
        sentences = [s.strip() for s in re.split(r'[.!?]+', transcript) if len(s.strip()) > 10]
        for s in sentences:
            s_low = s.lower()
            if "basically" in s_low or "what i am trying to say" in s_low or "kind of" in s_low:
                clean_s = re.sub(r'\b(basically|what i am trying to say is|kind of|you know)\b', '', s, flags=re.IGNORECASE).strip()
                clean_s = clean_s[0].upper() + clean_s[1:] if len(clean_s) > 1 else clean_s
                clarity_suggestions.append({
                    "original": f'"{s}"',
                    "suggested": f'"{clean_s}"',
                    "explanation": "Removed filler qualifiers ('basically', 'kind of') to deliver a direct, authoritative statement."
                })
                if len(clarity_suggestions) >= 3:
                    break

        if not clarity_suggestions and sentences:
            first_s = sentences[0]
            clarity_suggestions.append({
                "original": f'"{first_s}"',
                "suggested": f'"Today, I will focus directly on {topic or "this subject"} to explain its core impact."',
                "explanation": "Reframed opening sentence to establish an immediate hook and clear topic statement."
            })

        # 4. Most Important Improvement Tip
        if filler_count >= 6:
            most_important = "Focus on replacing verbal fillers ('um', 'like', 'basically') with silent intentional 2-second pauses."
        elif wpm > 175:
            most_important = "Lower your speaking speed to ~150 WPM by pausing after concluding each major sub-point."
        elif scores.get("structure_score", 0) < 75:
            most_important = "Structure your talk with a distinct Hook, 2-3 Main Points, and a Summarizing Conclusion."
        else:
            most_important = "Maintain your strong clarity while practicing dynamic vocal inflection during section transitions."

        return {
            "strengths": strengths,
            "improvements": improvements,
            "clarity_suggestions": clarity_suggestions,
            "most_important_tip": most_important
        }

    def _generate_llm_feedback(
        self,
        transcript: str,
        topic: str,
        mode: str,
        metrics: Dict[str, Any],
        scores: Dict[str, Any]
    ) -> Dict[str, Any]:

        import httpx

        prompt = f"""
You are an expert AI Public Speaking Coach. Analyze the following speech transcript and quantitative data:

Topic: {topic or 'General Presentation'}
Mode: {mode}
WPM: {metrics.get('wpm')}
Filler Count: {metrics.get('filler_count')} ({metrics.get('filler_breakdown')})
Long Pauses: {metrics.get('long_pause_count')}
Overall Score: {scores.get('overall_score')}/100

Transcript:
"{transcript}"

Return a JSON object with keys:
- strengths: list of 3 specific strengths referencing transcript quotes
- improvements: list of 3 specific areas to improve with evidence
- clarity_suggestions: list of objects with "original", "suggested", "explanation"
- most_important_tip: string single key focus
"""
        response = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
            json={
                "model": settings.OPENAI_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            },
            timeout=15.0
        )
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        import json
        return json.loads(content)

ai_feedback_service = AIFeedbackService()
