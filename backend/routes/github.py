from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.project import Project
from models.collaboration import Collaboration
from services.encryption import decrypt
from services.github_service import (
    exchange_code_for_token, get_github_user,
    get_contributors, get_commit_activity, get_repo_info
)
import os

github_bp = Blueprint("github", __name__)

# ── OAuth ─────────────────────────────────────────────────────────────────────

@github_bp.route("/github/oauth/url", methods=["GET"])
@jwt_required()
def oauth_url():
    client_id = os.getenv("GITHUB_CLIENT_ID","")
    if not client_id:
        return jsonify({"error": "GitHub OAuth not configured."}), 500
    url = f"https://github.com/login/oauth/authorize?client_id={client_id}&scope=read:user"
    return jsonify({"url": url}), 200

@github_bp.route("/github/oauth/callback", methods=["POST"])
@jwt_required()
def oauth_callback():
    uid  = int(get_jwt_identity())
    code = request.get_json().get("code","")
    if not code:
        return jsonify({"error": "No code provided."}), 400
    token = exchange_code_for_token(code)
    if not token:
        return jsonify({"error": "Failed to exchange code for token."}), 400
    gh_user = get_github_user(token)
    if not gh_user:
        return jsonify({"error": "Failed to fetch GitHub user."}), 400
    user = User.query.get(uid)
    user.github_username = gh_user.get("login","")
    user.github_token    = token
    db.session.commit()
    return jsonify({
        "github_username": user.github_username,
        "avatar": gh_user.get("avatar_url",""),
        "profile": gh_user.get("html_url",""),
    }), 200

# ── Stats ─────────────────────────────────────────────────────────────────────

@github_bp.route("/projects/<int:pid>/github/stats", methods=["GET"])
@jwt_required()
def github_stats(pid):
    uid = int(get_jwt_identity())
    p   = Project.query.get_or_404(pid)
    # Members only
    is_member = (p.owner_id == uid) or \
        bool(Collaboration.query.filter_by(project_id=pid, user_id=uid, status="accepted").first())
    if not is_member:
        return jsonify({"error": "Not a project member."}), 403

    if not p.github_repo_name:
        return jsonify({"error": "No GitHub repo linked."}), 400

    owner_pat    = decrypt(p.owner.github_pat) if p.owner and p.owner.github_pat else ''
    repo_info    = get_repo_info(p.github_repo_name, owner_pat)
    contributors = get_contributors(p.github_repo_name, owner_pat)
    activity     = get_commit_activity(p.github_repo_name, owner_pat)

    # Map contributors to our users
    collabs      = Collaboration.query.filter_by(project_id=pid, status="accepted").all()
    members      = [p.owner] + [c.user for c in collabs if c.user]
    gh_map       = {m.github_username.lower(): m.to_dict() for m in members if m.github_username}

    enriched = []
    total_commits = sum(c.get("contributions", 0) for c in contributors)
    for c in contributors:
        login   = c.get("login","").lower()
        commits = c.get("contributions", 0)
        enriched.append({
            "github_login":  c.get("login"),
            "avatar":        c.get("avatar_url"),
            "commits":       commits,
            "percent":       round(commits / total_commits * 100, 1) if total_commits else 0,
            "profile_url":   c.get("html_url"),
            "user":          gh_map.get(login),
        })

    # Weekly totals for chart (last 12 weeks)
    weekly = []
    if activity:
        for week in activity[-12:]:
            weekly.append({"week": week.get("week"), "total": week.get("total",0)})

    return jsonify({
        "repo":         repo_info,
        "contributors": enriched,
        "weekly":       weekly,
        "total_commits": total_commits,
    }), 200

@github_bp.route("/projects/<int:pid>/github/progress", methods=["GET"])
@jwt_required()
def project_progress(pid):
    uid = int(get_jwt_identity())
    p   = Project.query.get_or_404(pid)
    is_member = (p.owner_id == uid) or \
        bool(Collaboration.query.filter_by(project_id=pid, user_id=uid, status="accepted").first())
    if not is_member:
        return jsonify({"error": "Not a project member."}), 403

    from models.task import Task
    tasks = Task.query.filter_by(project_id=pid).all()
    total = len(tasks)
    by_status = {}
    for t in tasks:
        by_status[t.status] = by_status.get(t.status, 0) + 1
    done  = by_status.get("done", 0)
    pct   = round(done / total * 100) if total else 0

    return jsonify({
        "total_tasks":    total,
        "by_status":      by_status,
        "completion_pct": pct,
        "collaborators":  Collaboration.query.filter_by(project_id=pid, status="accepted").count(),
        "pending":        Collaboration.query.filter_by(project_id=pid, status="pending").count(),
    }), 200
