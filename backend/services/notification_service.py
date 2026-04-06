"""
Notification service — the ONLY place notifications are created.

MIGRATION PATH → microservice:
  Replace this file with an HTTP client that POSTs to your
  notification microservice.  Zero other files change.

  Example swap:
    def notify(...):
        requests.post(NOTIF_SERVICE_URL + "/internal/notify", json={...}, ...)

  The rest of the codebase calls notify() the same way.
"""
from models import db
from models.notification import Notification
from socket_events import emit_notification


def notify(
    user_id: int,
    type: str,
    title: str,
    body: str = "",
    link: str = "",
    actor_id: int = None,
) -> Notification:
    """
    Create a persistent notification and push it live via Socket.IO.

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

    # Push real-time to the recipient's personal room
    # When migrating: swap this for an HTTP call to the notif microservice
    emit_notification(user_id, notif.to_dict())

    return notif
