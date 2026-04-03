"""
Global LinkedIn-style posts visible to all platform users.
Separate from ProjectPost (internal team feed).
"""
from models import db
from datetime import datetime

class Post(db.Model):
    __tablename__ = "posts"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body       = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    edited_at  = db.Column(db.DateTime, nullable=True)

    author      = db.relationship("User", foreign_keys=[user_id])
    attachments = db.relationship("PostFile",    backref="post", lazy=True, cascade="all, delete-orphan")
    likes       = db.relationship("PostLike",    backref="post", lazy=True, cascade="all, delete-orphan")
    comments    = db.relationship("PostComment", backref="post", lazy=True, cascade="all, delete-orphan",
                                  primaryjoin="and_(PostComment.post_id==Post.id, PostComment.parent_id==None)")

    def to_dict(self, current_user_id=None):
        return {
            "id":          self.id,
            "user_id":     self.user_id,
            "body":        self.body,
            "created_at":  self.created_at.isoformat(),
            "edited_at":   self.edited_at.isoformat() if self.edited_at else None,
            "author": {
                "id": self.author.id, "name": self.author.name,
                "avatar_url": self.author.avatar_url,
                "level": self.author.level, "skills": self.author.skills,
            } if self.author else None,
            "attachments":  [a.to_dict() for a in self.attachments],
            "likes_count":  len(self.likes),
            "liked_by_me":  any(l.user_id == current_user_id for l in self.likes) if current_user_id else False,
            "comments_count": PostComment.query.filter_by(post_id=self.id).count(),
        }


class PostFile(db.Model):
    __tablename__ = "post_files"
    id        = db.Column(db.Integer, primary_key=True)
    post_id   = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    file_url  = db.Column(db.String(400), nullable=False)
    file_name = db.Column(db.String(200), default="")
    file_type = db.Column(db.String(20), default="file")
    file_size = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {"id": self.id, "post_id": self.post_id, "file_url": self.file_url,
                "file_name": self.file_name, "file_type": self.file_type, "file_size": self.file_size}


class PostLike(db.Model):
    __tablename__ = "post_likes"
    id         = db.Column(db.Integer, primary_key=True)
    post_id    = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user       = db.relationship("User")


class PostComment(db.Model):
    __tablename__ = "post_comments"
    id         = db.Column(db.Integer, primary_key=True)
    post_id    = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body       = db.Column(db.Text, nullable=False)
    parent_id  = db.Column(db.Integer, db.ForeignKey("post_comments.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    author  = db.relationship("User", foreign_keys=[user_id])
    replies = db.relationship("PostComment",
                              backref=db.backref("parent", remote_side=[id]),
                              lazy=True, foreign_keys=[parent_id])

    def to_dict(self, include_replies=True):
        d = {
            "id": self.id, "post_id": self.post_id, "user_id": self.user_id,
            "body": self.body, "parent_id": self.parent_id,
            "created_at": self.created_at.isoformat(),
            "author": {"id": self.author.id, "name": self.author.name,
                       "avatar_url": self.author.avatar_url} if self.author else None,
        }
        if include_replies:
            d["replies"] = [r.to_dict(include_replies=False) for r in self.replies]
        return d
