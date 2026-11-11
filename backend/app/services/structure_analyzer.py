import re
from typing import Dict, Any, List

class StructureAnalyzerService:
    def analyze_structure(self, transcript: str, topic: str = "") -> Dict[str, Any]:
        if not transcript or len(transcript.strip()) < 30:
            return {
                "overall_structure_score": 60.0,
                "opening_score": 60.0,
                "body_score": 60.0,
                "conclusion_score": 60.0,
                "detected_sections": {
                    "has_hook": False,
                    "has_topic_statement": False,
                    "has_transitions": False,
                    "has_summary": False
                }
            }

        text = transcript.lower()
        sentences = [s.strip() for s in re.split(r'[.!?]+', transcript) if len(s.strip()) > 3]

        if not sentences:
            return {
                "overall_structure_score": 65.0,
                "opening_score": 65.0,
                "body_score": 65.0,
                "conclusion_score": 65.0,
                "detected_sections": {}
            }

        total_sentences = len(sentences)
        opening_text = " ".join(sentences[:max(1, int(total_sentences * 0.25))]).lower()
        conclusion_text = " ".join(sentences[max(1, int(total_sentences * 0.75)):]).lower()
        body_text = " ".join(sentences[int(total_sentences * 0.25):int(total_sentences * 0.75)]).lower()

        # 1. Opening Analysis
        hook_keywords = ["today", "welcome", "imagine", "have you ever", "good morning", "good afternoon", "let me start", "excited to speak", "question"]
        topic_keywords = ["talk about", "presenting", "topic", "discuss", "explain", "overview", "focus on"]
        if topic:
            topic_words = [w.lower() for w in topic.split() if len(w) > 3]
            topic_keywords.extend(topic_words)

        has_hook = any(k in opening_text for k in hook_keywords)
        has_topic_statement = any(k in opening_text for k in topic_keywords)

        opening_score = 65.0
        if has_hook: opening_score += 18.0
        if has_topic_statement: opening_score += 17.0
        opening_score = min(100.0, opening_score)

        # 2. Main Body & Transitions Analysis
        transition_words = ["first", "secondly", "furthermore", "moreover", "for example", "however", "on the other hand", "next", "in addition", "specifically", "because"]
        found_transitions = [t for t in transition_words if t in body_text]
        has_transitions = len(found_transitions) >= 2

        body_score = 65.0
        if len(sentences) >= 4: body_score += 15.0
        if has_transitions: body_score += 20.0
        body_score = min(100.0, body_score)

        # 3. Conclusion Analysis
        conclusion_keywords = ["in conclusion", "to sum up", "finally", "thank you", "in summary", "overall", "key takeaway", "questions"]
        has_summary = any(k in conclusion_text for k in conclusion_keywords)

        conclusion_score = 65.0
        if has_summary: conclusion_score += 30.0
        if len(sentences) >= 3: conclusion_score += 5.0
        conclusion_score = min(100.0, conclusion_score)

        overall_structure_score = round(
            (opening_score * 0.3) + (body_score * 0.4) + (conclusion_score * 0.3), 1
        )

        return {
            "overall_structure_score": overall_structure_score,
            "opening_score": round(opening_score, 1),
            "body_score": round(body_score, 1),
            "conclusion_score": round(conclusion_score, 1),
            "detected_sections": {
                "has_hook": has_hook,
                "has_topic_statement": has_topic_statement,
                "has_transitions": has_transitions,
                "has_summary": has_summary,
                "found_transitions": found_transitions
            }
        }

structure_analyzer_service = StructureAnalyzerService()
