from models import db
from datetime import datetime

class Collaboration(db.Model):
    __tablename__ = "collaborations"

    id           = db.Column(db.Integer, primary_key=True)
    project_id   = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status       = db.Column(db.String(20), default="pending")  # pending/accepted/rejected
    role         = db.Column(db.String(100), default="Collaborator")
    matched_skills = db.Column(db.Text, default="")  # comma-separated matching skills
    github_added = db.Column(db.Boolean, default=False)
    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "status": self.status,
            "role": self.role,
            "matched_skills": self.matched_skills,
            "github_added": self.github_added,
            "requested_at": self.requested_at.isoformat(),
            "user": {
                "id": self.user.id,
                "name": self.user.name,
                "email": self.user.email,
                "skills": self.user.skills,
                "level": self.user.level,
                "avatar_url": self.user.avatar_url,
                "github_username": self.user.github_username,
            } if self.user else None,
        }
