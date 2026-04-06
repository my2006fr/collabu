"""
Notification service — the ONLY place notifications are created.

MIGRATION PATH → microservice:
  Replace this file with an HTTP client that POSTs to your
  notification microservice.  Zero other files change.
"""
from models import db
from models.notification import Notification
from socket_events import emit_notification
from services.push_service import send_push_notification


def notify(
    user_id: int,
    type: str,
    title: str,
    body: str = "",
    link: str = "",
    actor_id: int = None,
) -> Notification:
    """
    Create a persistent notification, push it live via Socket.IO,
    and send a Web Push notification if the user has subscribed.

    Args:
        user_id:  Recipient user id.
        type:     One of the NOTIF_* constants from models/notification.py.
        title:    Short notification title (shown in bell dropdown).
        body:     Optional longer description.
        link:     Frontend route the user is taken to on click (e.g. /projects/3).
        actor_id: User who triggered the action (shown as avatar).

    Returns:
        The created Notification ORM instance.
    """
    notif = Notification(
        user_id=user_id,
        actor_id=actor_id,
        type=type,
        title=title,
        body=body,
        link=link,
    )
    db.session.add(notif)
    db.session.commit()

    # Real-time in-app push
    emit_notification(user_id, notif.to_dict())

    # Out-of-site Web Push (if user has a push subscription)
    try:
        send_push_notification(user_id, title=title, body=body, link=link)
    except Exception:
        pass  # never let push failures break the main flow

    return notif
