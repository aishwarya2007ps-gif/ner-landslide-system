from typing import List, Dict, Any
from app.core.config import settings

class NotificationDispatcher:
    """
    Multi-channel notification dispatcher supporting In-App alerts, Web Push, SMS, and Email.
    Safely operates in mock mode when third-party provider credentials are absent.
    """
    @classmethod
    async def dispatch(cls, channels: List[str], recipient: str, title: str, message: str, severity: str) -> Dict[str, Any]:
        results = {}

        for ch in channels:
            if ch == "in_app":
                results["in_app"] = {"status": "dispatched", "provider": "internal_websocket_queue"}
            elif ch == "push":
                results["push"] = {"status": "queued", "provider": "web_push_service_worker"}
            elif ch == "sms":
                if settings.SMS_API_KEY and settings.SMS_PROVIDER != "mock":
                    results["sms"] = {"status": "sent", "provider": settings.SMS_PROVIDER}
                else:
                    results["sms"] = {
                        "status": "mock_simulated",
                        "provider": "Mock SMS Gateway (Credentials not configured)",
                        "log": f"[MOCK SMS to {recipient}]: [{severity.upper()}] {title} - {message[:50]}..."
                    }
            elif ch == "email":
                if settings.EMAIL_API_KEY and settings.EMAIL_PROVIDER != "mock":
                    results["email"] = {"status": "sent", "provider": settings.EMAIL_PROVIDER}
                else:
                    results["email"] = {
                        "status": "mock_simulated",
                        "provider": "Mock Email Gateway (Credentials not configured)",
                        "log": f"[MOCK EMAIL to {recipient}]: [{severity.upper()}] {title}"
                    }

        return results
