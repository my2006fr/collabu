from models import db
from datetime import datetime

class Project(db.Model):
    __tablename__ = "projects"

    id                = db.Column(db.Integer, primary_key=True)
    title             = db.Column(db.String(200), nullable=False)
    description       = db.Column(db.Text, nullable=False)
    required_skills   = db.Column(db.Text, default="")
    github_repo_link  = db.Column(db.String(300), nullable=False)
    github_repo_name  = db.Column(db.String(200), default="")  # owner/repo format
    methodology       = db.Column(db.String(50), default="Agile")
    owner_id          = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    cover_image_url   = db.Column(db.String(300), default="")
    status            = db.Column(db.String(30), default="active")  # active/completed/paused
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    collaborations    = db.relationship("Collaboration", backref="project", lazy=True, cascade="all, delete-orphan")
    tasks             = db.relationship("Task", backref="project", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_owner=True):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "required_skills": self.required_skills,
            "github_repo_link": self.github_repo_link,
            "github_repo_name": self.github_repo_name,
            "methodology": self.methodology,
            "owner_id": self.owner_id,
            "cover_image_url": self.cover_image_url,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }
        if include_owner and self.owner:
            data["owner"] = {
                "id": self.owner.id,
                "name": self.owner.name,
                "email": self.owner.email,
                "avatar_url": self.owner.avatar_url,
                "github_username": self.owner.github_username,
            }
        return data
