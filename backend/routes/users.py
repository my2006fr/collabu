from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from services.auth_service import hash_password, check_password
from services.upload_service import save_avatar
from services.github_service import verify_pat
from services.encryption import encrypt, decrypt
import re

users_bp = Blueprint("users", __name__)

PASSWORD_MIN = 8
PASSWORD_RE  = re.compile(r'^(?=.*[A-Za-z])(?=.*\d).{8,}$')

# ── Profile ───────────────────────────────────────────────────────────────────

@users_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200

@users_bp.route("/profile", methods=["PATCH"])
@jwt_required()
def update_profile():
    user = User.query.get(int(get_jwt_identity()))
    d    = request.get_json() or {}
    if "name" in d:
        name = d["name"].strip()
        if not name:
            return jsonify({"error": "Name cannot be empty."}), 400
        user.name = name
    if "bio"             in d: user.bio             = d["bio"][:500]
    if "skills"          in d: user.skills          = d["skills"][:300]
    if "github_username" in d: user.github_username = d["github_username"].strip()[:100]
    if "level"           in d and d["level"] in ["beginner","intermediate","advanced"]:
        user.level = d["level"]
    if "theme"           in d and d["theme"] in ["dark","light"]:
        user.theme = d["theme"]
    if "language"        in d: user.language = d["language"][:10]
    db.session.commit()
    return jsonify({"user": user.to_dict()}), 200

@users_bp.route("/profile/avatar", methods=["POST"])
@jwt_required()
def upload_avatar():
    user = User.query.get(int(get_jwt_identity()))
    if "avatar" not in request.files:
        return jsonify({"error": "No file provided."}), 400
    try:
        url = save_avatar(request.files["avatar"])
        user.avatar_url = url
        db.session.commit()
        return jsonify({"avatar_url": url}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@users_bp.route("/profile/password", methods=["POST"])
@jwt_required()
def change_password():
    user = User.query.get(int(get_jwt_identity()))
    d    = request.get_json() or {}
    if not check_password(d.get("current_password",""), user.password_hash):
        return jsonify({"error": "Current password is incorrect."}), 400
    new_pw = d.get("new_password","")
    if len(new_pw) < PASSWORD_MIN:
        return jsonify({"error": f"Password must be at least {PASSWORD_MIN} characters."}), 400
    if not re.search(r'[A-Za-z]', new_pw) or not re.search(r'\d', new_pw):
        return jsonify({"error": "Password must contain at least one letter and one number."}), 400
    user.password_hash = hash_password(new_pw)
    db.session.commit()
    return jsonify({"message": "Password updated."}), 200

# ── GitHub PAT — encrypted at rest ───────────────────────────────────────────

@users_bp.route("/profile/github-pat", methods=["POST"])
@jwt_required()
def save_github_pat():
    user = User.query.get(int(get_jwt_identity()))
    d    = request.get_json() or {}
    pat  = (d.get("pat") or "").strip()
    if not pat:
        return jsonify({"error": "PAT is required."}), 400
    # Verify it works first
    result = verify_pat(pat)
    if not result["ok"]:
        return jsonify({"error": result["error"]}), 400
    # Encrypt before storing
    user.github_pat      = encrypt(pat)
    user.github_username = result["login"]
    db.session.commit()
    return jsonify({
        "message":         "GitHub PAT verified and saved securely.",
        "github_username": user.github_username,
        "has_github_pat":  True,
    }), 200

@users_bp.route("/profile/github-pat", methods=["DELETE"])
@jwt_required()
def remove_github_pat():
    user = User.query.get(int(get_jwt_identity()))
    user.github_pat = ""
    db.session.commit()
    return jsonify({"message": "GitHub PAT removed.", "has_github_pat": False}), 200

@users_bp.route("/users/<int:uid>", methods=["GET"])
@jwt_required()
def get_user(uid):
    user = User.query.get(uid)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200
