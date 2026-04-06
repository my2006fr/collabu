"""
PushSubscription model.
Stores the browser's Web Push subscription object (endpoint + keys) per user.
A user can have multiple subscriptions (one per device/browser).
"""
from models import db
from datetime import datetime


class PushSubscription(db.Model):
    __tablename__ = "push_subscriptions"

    id                = db.Column(db.Integer, primary_key=True)
    user_id           = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    # Full JSON blob from PushSubscription.toJSON() — includes endpoint, keys, expirationTime
    subscription_json = db.Column(db.Text, nullable=False)
    # The endpoint URL extracted for quick dedup checks
    endpoint          = db.Column(db.String(500), nullable=False, unique=True)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("push_subscriptions", lazy=True))

    def to_dict(self):
        return {
            "id":         self.id,
            "user_id":    self.user_id,
            "endpoint":   self.endpoint,
            "created_at": self.created_at.isoformat(),
        }
