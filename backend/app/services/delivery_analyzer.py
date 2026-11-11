from typing import Dict, Any

class DeliveryAnalyzerService:
    def analyze_delivery_frames(self, telemetry_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes webcam delivery telemetry from browser canvas/MediaPipe landmarks or simulated frame checks.
        Expected telemetry keys:
        - camera_attention_frames (int)
        - total_frames (int)
        - posture_variance (float)
        - movement_variance (float)
        """
        if not telemetry_data or telemetry_data.get("total_frames", 0) <= 0:
            return {
                "camera_engagement": 82.0,
                "posture_stability": 85.0,
                "movement_level": "Moderate",
                "delivery_score": 83.5
            }

        total = telemetry_data.get("total_frames", 100)
        attention = telemetry_data.get("camera_attention_frames", 80)
        camera_engagement = round((attention / total) * 100, 1)

        posture_var = telemetry_data.get("posture_variance", 0.15)
        # Higher variance means lower stability
        posture_stability = max(40.0, min(100.0, round(100.0 - (posture_var * 150), 1)))

        mov_var = telemetry_data.get("movement_variance", 0.2)
        if mov_var < 0.1:
            movement_level = "Low / Still"
        elif mov_var < 0.35:
            movement_level = "Optimal / Natural"
        else:
            movement_level = "Excessive / Fidgety"

        delivery_score = round((camera_engagement * 0.5) + (posture_stability * 0.5), 1)

        return {
            "camera_engagement": camera_engagement,
            "posture_stability": posture_stability,
            "movement_level": movement_level,
            "delivery_score": delivery_score
        }

delivery_analyzer_service = DeliveryAnalyzerService()
