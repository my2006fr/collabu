from models import db
from datetime import datetime

class TaskComment(db.Model):
    __tablename__ = "task_comments"

    id         = db.Column(db.Integer, primary_key=True)
    task_id    = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body       = db.Column(db.Text, nullable=False)
    parent_id  = db.Column(db.Integer, db.ForeignKey("task_comments.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    author  = db.relationship("User", foreign_keys=[user_id])
    replies = db.relationship("TaskComment", backref=db.backref("parent", remote_side=[id]), lazy=True)

    def to_dict(self, include_replies=True):
        data = {
            "id": self.id,
            "task_id": self.task_id,
            "user_id": self.user_id,
            "body": self.body,
            "parent_id": self.parent_id,
            "author": {
                "id": self.author.id,
                "name": self.author.name,
                "avatar_url": self.author.avatar_url,
            } if self.author else None,
            "created_at": self.created_at.isoformat(),
        }
        if include_replies:
            data["replies"] = [r.to_dict(include_replies=False) for r in self.replies]
        return data
