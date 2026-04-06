"""
Notification model.

MIGRATION PATH → microservice:
  When you outgrow the monolith, this model + routes/notifications.py +
  the notify() helper in services/notification_service.py are the ONLY
  things that need to move.  Everything else stays.
"""
from models import db
from datetime import datetime

# ── Notification types ────────────────────────────────────────────────────────
# Adding a new type = add a constant here + handle it in the frontend badge/icon
NOTIF_JOIN_REQUEST  = "join_request"   # someone asked to join your project
NOTIF_JOIN_ACCEPTED = "join_accepted"  # your join request was accepted
NOTIF_JOIN_REJECTED = "join_rejected"  # your join request was rejected
NOTIF_TASK_ASSIGNED = "task_assigned"  # a task was assigned to you
NOTIF_TASK_UPDATED  = "task_updated"   # a task you own was moved/updated
NOTIF_NEW_MEMBER    = "new_member"     # project owner: new member joined
NOTIF_MENTION       = "mention"        # @mention in chat or post (future)

ALL_TYPES = [
    NOTIF_JOIN_REQUEST, NOTIF_JOIN_ACCEPTED, NOTIF_JOIN_REJECTED,
    NOTIF_TASK_ASSIGNED, NOTIF_TASK_UPDATED, NOTIF_NEW_MEMBER, NOTIF_MENTION,
]


class Notification(db.Model):
    __tablename__ = "notifications"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)  # recipient
    actor_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)   # who triggered it
    type       = db.Column(db.String(40), nullable=False)
    title      = db.Column(db.String(200), nullable=False)
    body       = db.Column(db.Text, default="")
    link       = db.Column(db.String(300), default="")   # frontend route to navigate to
    is_read    = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    recipient  = db.relationship("User", foreign_keys=[user_id])
    actor      = db.relationship("User", foreign_keys=[actor_id])

    def to_dict(self):
        return {
            "id":         self.id,
            "user_id":    self.user_id,
            "type":       self.type,
            "title":      self.title,
            "body":       self.body,
            "link":       self.link,
            "is_read":    self.is_read,
            "created_at": self.created_at.isoformat(),
            "actor": {
                "id":         self.actor.id,
                "name":       self.actor.name,
                "avatar_url": self.actor.avatar_url,
            } if self.actor else None,
        }
