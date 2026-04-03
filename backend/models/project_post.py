from models import db
from datetime import datetime

class ProjectPost(db.Model):
    """Project feed posts — text + optional image/file attachments."""
    __tablename__ = "project_posts"

    id          = db.Column(db.Integer, primary_key=True)
    project_id  = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body        = db.Column(db.Text, default="")
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    author      = db.relationship("User", foreign_keys=[user_id])
    attachments = db.relationship("PostAttachment", backref="post", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id":           self.id,
            "project_id":   self.project_id,
            "user_id":      self.user_id,
            "body":         self.body,
            "created_at":   self.created_at.isoformat(),
            "author": {
                "id":         self.author.id,
                "name":       self.author.name,
                "avatar_url": self.author.avatar_url,
            } if self.author else None,
            "attachments": [a.to_dict() for a in self.attachments],
        }


class PostAttachment(db.Model):
    __tablename__ = "post_attachments"

    id          = db.Column(db.Integer, primary_key=True)
    post_id     = db.Column(db.Integer, db.ForeignKey("project_posts.id"), nullable=False)
    file_url    = db.Column(db.String(400), nullable=False)
    file_name   = db.Column(db.String(200), default="")
    file_type   = db.Column(db.String(20), default="file")  # image/video/audio/pdf/spreadsheet/file
    file_size   = db.Column(db.Integer, default=0)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":        self.id,
            "post_id":   self.post_id,
            "file_url":  self.file_url,
            "file_name": self.file_name,
            "file_type": self.file_type,
            "file_size": self.file_size,
        }
