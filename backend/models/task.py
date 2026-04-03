from models import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = "tasks"

    id           = db.Column(db.Integer, primary_key=True)
    project_id   = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    title        = db.Column(db.String(200), nullable=False)
    description  = db.Column(db.Text, default="")
    status       = db.Column(db.String(30), default="todo")   # todo/in_progress/review/done
    priority     = db.Column(db.String(20), default="medium") # low/medium/high/critical
    required_skill = db.Column(db.String(100), default="")
    assignee_id  = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_by   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    due_date     = db.Column(db.DateTime, nullable=True)
    position     = db.Column(db.Integer, default=0)  # order within column
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    comments     = db.relationship("TaskComment", backref="task", lazy=True, cascade="all, delete-orphan")
    creator      = db.relationship("User", foreign_keys=[created_by])

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "required_skill": self.required_skill,
            "assignee_id": self.assignee_id,
            "assignee": {
                "id": self.assignee.id,
                "name": self.assignee.name,
                "avatar_url": self.assignee.avatar_url,
                "skills": self.assignee.skills,
            } if self.assignee else None,
            "created_by": self.created_by,
            "creator": {
                "id": self.creator.id,
                "name": self.creator.name,
            } if self.creator else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "position": self.position,
            "comments_count": len(self.comments),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
