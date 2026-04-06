"""
Web Push notification service.

Uses the pywebpush library to send RFC-8030 / VAPID Web Push messages
to subscribed browsers.  Subscriptions are stored in PushSubscription.

SETUP (one-time per environment):
  pip install pywebpush
  python -c "from py_vapid import Vapid; v=Vapid(); v.generate_keys(); \
             print('VAPID_PRIVATE_KEY:', v.private_key.private_bytes(...)); ..."

  Easier: run  `python generate_vapid.py`  (included below) and copy
  VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY into your .env file.

ENVIRONMENT VARIABLES:
  VAPID_PRIVATE_KEY   Base64-encoded VAPID private key
  VAPID_PUBLIC_KEY    Base64-encoded VAPID public key (sent to the client)
  VAPID_EMAIL         mailto: address used in the VAPID claim (e.g. admin@uni.edu)
  FRONTEND_URL        Your frontend origin (e.g. https://yourapp.vercel.app)
"""
import os
import json
from models import db
from models.push_subscription import PushSubscription

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "")
VAPID_PUBLIC_KEY  = os.getenv("VAPID_PUBLIC_KEY", "")
VAPID_EMAIL       = os.getenv("VAPID_EMAIL", "mailto:admin@example.com")
FRONTEND_URL      = os.getenv("FRONTEND_URL", "http://localhost:5173")


def send_push_notification(user_id: int, title: str, body: str = "", link: str = "") -> None:
    """
    Send a Web Push message to every active subscription belonging to user_id.
    Silent no-op if pywebpush is not installed or no VAPID keys are configured.
    Expired/invalid subscriptions are automatically removed.
    """
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        return  # Push not configured — skip silently

    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        return  # pywebpush not installed — skip silently

    subscriptions = PushSubscription.query.filter_by(user_id=user_id).all()
    if not subscriptions:
        return

    payload = json.dumps({
        "title": title,
        "body":  body,
        "link":  link,
        "icon":  f"{FRONTEND_URL}/logo.svg",
    })

    expired = []
    for sub in subscriptions:
        try:
            sub_info = json.loads(sub.subscription_json)
            webpush(
                subscription_info=sub_info,
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": VAPID_EMAIL},
            )
        except WebPushException as e:
            # 410 Gone = subscription expired; 404 = endpoint not found
            if e.response and e.response.status_code in (404, 410):
                expired.append(sub)
        except Exception:
            pass  # don't break other subscribers

    # Clean up dead subscriptions
    for sub in expired:
        db.session.delete(sub)
    if expired:
        db.session.commit()
