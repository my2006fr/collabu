"""
Web Push notification service.

Uses pywebpush to send RFC-8030 / VAPID Web Push messages to subscribed browsers.

ENVIRONMENT VARIABLES (set in .env):
  VAPID_PRIVATE_KEY   Raw EC private key as URL-safe base64 (43 chars, no padding)
                      OR a PEM string — py_vapid auto-detects both formats.
  VAPID_PUBLIC_KEY    Raw uncompressed EC point as URL-safe base64 (87 chars, no padding)
                      This is what the browser receives via GET /push/vapid-public-key.
  VAPID_EMAIL         mailto: address (e.g. mailto:admin@uni.edu)
  FRONTEND_URL        Your frontend origin (e.g. https://yourapp.vercel.app)

Generate correct keys by running:
    python generate_vapid.py
"""
import os
import json
import logging

logger = logging.getLogger(__name__)


def _get_config():
    """
    Read VAPID config at call time (not at import time).
    This is critical — module-level os.getenv() runs before load_dotenv()
    if the module is imported early, returning empty strings every time.
    """
    return {
        "private_key": os.getenv("VAPID_PRIVATE_KEY", ""),
        "public_key":  os.getenv("VAPID_PUBLIC_KEY", ""),
        "email":       os.getenv("VAPID_EMAIL", "mailto:admin@example.com"),
        "frontend":    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    }


def send_push_notification(user_id: int, title: str, body: str = "", link: str = "") -> None:
    """
    Send a Web Push message to every active subscription belonging to user_id.

    Silent no-op if:
    - pywebpush is not installed
    - VAPID keys are not configured

    Expired / invalid subscriptions (HTTP 404/410) are automatically removed.
    """
    from models import db
    from models.push_subscription import PushSubscription

    cfg = _get_config()

    if not cfg["private_key"] or not cfg["public_key"]:
        logger.warning(
            "[push] VAPID keys not configured — skipping push for user %s. "
            "Run `python generate_vapid.py` and add VAPID_PRIVATE_KEY / "
            "VAPID_PUBLIC_KEY to your .env file.",
            user_id,
        )
        return

    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        logger.warning("[push] pywebpush not installed — run `pip install pywebpush`")
        return

    subscriptions = PushSubscription.query.filter_by(user_id=user_id).all()
    if not subscriptions:
        return

    payload = json.dumps({
        "title": title,
        "body":  body,
        "link":  link,
        "icon":  f"{cfg['frontend']}/logo.svg",
    })

    expired = []
    for sub in subscriptions:
        try:
            sub_info = json.loads(sub.subscription_json)
            webpush(
                subscription_info=sub_info,
                data=payload,
                vapid_private_key=cfg["private_key"],
                vapid_claims={
                    "sub": cfg["email"],
                    # 'aud' is derived automatically by pywebpush from the endpoint origin
                },
                ttl=86400,  # notification valid for 24 h if device is offline
            )
            logger.debug("[push] sent to user %s endpoint %s…", user_id, sub.endpoint[:40])
        except WebPushException as e:
            status = e.response.status_code if e.response else None
            if status in (404, 410):
                logger.info("[push] subscription expired (HTTP %s) — removing.", status)
                expired.append(sub)
            else:
                logger.error("[push] WebPushException for user %s: %s", user_id, e)
        except Exception as e:
            logger.error("[push] unexpected error for user %s: %s", user_id, e)

    # Clean up dead subscriptions
    for sub in expired:
        db.session.delete(sub)
    if expired:
        db.session.commit()
