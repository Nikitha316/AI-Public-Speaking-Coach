import pytest
from app.services.speech_analytics import speech_analytics_service
from app.services.scoring_engine import scoring_engine_service

def test_wpm_calculation():
    # 300 words in 2 minutes = 150 WPM
    wpm = speech_analytics_service.calculate_wpm(300, 120.0)
    assert wpm == 150.0

    # Edge cases
    assert speech_analytics_service.calculate_wpm(0, 60.0) == 0.0
    assert speech_analytics_service.calculate_wpm(100, 0.0) == 0.0


def test_filler_word_detection():
    text = "Basically I am, like, really excited, um, you know, to talk about this."
    count, breakdown, occurrences = speech_analytics_service.detect_filler_words(text)
    
    assert count >= 4
    assert "basically" in breakdown
    assert "like" in breakdown
    assert "um" in breakdown
    assert "you know" in breakdown


def test_pause_analysis():
    pause_events = [
        {"duration": 1.5, "is_between_sentences": True},
        {"duration": 2.0, "is_between_sentences": True},
        {"duration": 4.5, "is_between_sentences": False}  # Awkward long pause
    ]
    result = speech_analytics_service.analyze_pauses(pause_events)
    assert result["total_pauses"] == 3
    assert result["natural_pauses"] == 2
    assert result["long_pauses"] == 1
    assert result["pause_score"] < 100.0


def test_scoring_engine_math():
    pause_data = {"pause_score": 85.0, "long_pause_count": 1, "natural_pauses": 4}
    structure_data = {"overall_structure_score": 80.0, "opening_score": 85.0, "body_score": 75.0, "conclusion_score": 80.0}
    
    scores = scoring_engine_service.calculate_scores(
        mode="presentation",
        wpm=150.0,  # Ideal
        total_words=500,
        filler_count=3,
        pause_data=pause_data,
        structure_data=structure_data,
        vocab_diversity=65.0,
        target_duration_seconds=300,
        actual_duration_seconds=300
    )

    assert "overall_score" in scores
    assert scores["overall_score"] >= 75.0
    assert "score_derivation" in scores
    assert scores["score_derivation"]["weights"]["pace"] == 0.20
