from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from models import db
from models.user import User
from services.auth_service import hash_password, check_password, is_allowed_email
import re

auth_bp = Blueprint("auth", __name__)

PASSWORD_MIN = 8

def validate_password(pw: str):
    """Returns (ok: bool, error_msg: str)."""
    if len(pw) < PASSWORD_MIN:
        return False, f"Password must be at least {PASSWORD_MIN} characters."
    if not re.search(r'[A-Za-z]', pw):
        return False, "Password must contain at least one letter."
    if not re.search(r'\d', pw):
        return False, "Password must contain at least one number."
    return True, ""

@auth_bp.route("/register", methods=["POST"])
def register():
    d        = request.get_json() or {}
    name     = d.get("name", "").strip()
    email    = d.get("email", "").strip().lower()
    password = d.get("password", "")
    skills   = d.get("skills", "")
    level    = d.get("level", "beginner")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400

    if not is_allowed_email(email):
        return jsonify({"error": "Only university email addresses are allowed."}), 403

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 409

    ok, err = validate_password(password)
    if not ok:
        return jsonify({"error": err}), 400

    if level not in ["beginner", "intermediate", "advanced"]:
        level = "beginner"

    user = User(
        name=name, email=email,
        password_hash=hash_password(password),
        skills=skills, level=level
    )
    db.session.add(user)
    db.session.commit()

    access  = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return jsonify({"token": access, "refresh_token": refresh, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    d        = request.get_json() or {}
    email    = d.get("email", "").strip().lower()
    password = d.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password(password, user.password_hash):
        return jsonify({"error": "Invalid email or password."}), 401

    access  = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return jsonify({"token": access, "refresh_token": refresh, "user": user.to_dict()}), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    """Use a refresh token to get a new access token without re-logging in."""
    uid    = get_jwt_identity()
    access = create_access_token(identity=uid)
    return jsonify({"token": access}), 200
