from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.notification import Notification

notifications_bp = Blueprint("notifications", __name__)


# ── GET /notifications ────────────────────────────────────────────────────────
# Returns the 40 most recent notifications for the current user.
# Accepts ?unread_only=true to filter.

@notifications_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    uid         = int(get_jwt_identity())
    unread_only = request.args.get("unread_only", "false").lower() == "true"
    page        = request.args.get("page", 1, type=int)
    per_page    = 40

    q = Notification.query.filter_by(user_id=uid)
    if unread_only:
        q = q.filter_by(is_read=False)
    q = q.order_by(Notification.created_at.desc())

    total  = q.count()
    items  = q.offset((page - 1) * per_page).limit(per_page).all()

    unread_count = Notification.query.filter_by(user_id=uid, is_read=False).count()

    return jsonify({
        "notifications": [n.to_dict() for n in items],
        "unread_count":  unread_count,
        "total":         total,
        "page":          page,
        "pages":         (total + per_page - 1) // per_page,
    }), 200


# ── GET /notifications/unread-count ──────────────────────────────────────────
# Lightweight poll endpoint — just the unread count number.

@notifications_bp.route("/notifications/unread-count", methods=["GET"])
@jwt_required()
def unread_count():
    uid   = int(get_jwt_identity())
    count = Notification.query.filter_by(user_id=uid, is_read=False).count()
    return jsonify({"unread_count": count}), 200


# ── PATCH /notifications/<id>/read ────────────────────────────────────────────
# Mark a single notification as read.

@notifications_bp.route("/notifications/<int:nid>/read", methods=["PATCH"])
@jwt_required()
def mark_read(nid):
    uid   = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=nid, user_id=uid).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify({"notification": notif.to_dict()}), 200


# ── PATCH /notifications/read-all ─────────────────────────────────────────────
# Mark ALL unread notifications as read for this user.

@notifications_bp.route("/notifications/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_read():
    uid = int(get_jwt_identity())
    Notification.query.filter_by(user_id=uid, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read."}), 200


# ── DELETE /notifications/<id> ────────────────────────────────────────────────
# Delete a single notification.

@notifications_bp.route("/notifications/<int:nid>", methods=["DELETE"])
@jwt_required()
def delete_notification(nid):
    uid   = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=nid, user_id=uid).first_or_404()
    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Deleted."}), 200


# ── DELETE /notifications ─────────────────────────────────────────────────────
# Clear ALL notifications for this user.

@notifications_bp.route("/notifications", methods=["DELETE"])
@jwt_required()
def clear_all():
    uid = int(get_jwt_identity())
    Notification.query.filter_by(user_id=uid).delete()
    db.session.commit()
    return jsonify({"message": "All notifications cleared."}), 200
