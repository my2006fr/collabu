"""
Push subscription management routes.

POST   /push/subscribe      — save a browser push subscription
DELETE /push/unsubscribe    — remove a push subscription by endpoint
GET    /push/vapid-public-key — return the VAPID public key (needed by the SW)
"""
import os
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.push_subscription import PushSubscription

push_bp = Blueprint("push", __name__)


@push_bp.route("/push/vapid-public-key", methods=["GET"])
def get_vapid_key():
    """Return the VAPID public key so the frontend SW can subscribe."""
    key = os.getenv("VAPID_PUBLIC_KEY", "")
    if not key:
        return jsonify({"error": "Push notifications not configured."}), 503
    return jsonify({"public_key": key}), 200


@push_bp.route("/push/subscribe", methods=["POST"])
@jwt_required()
def subscribe():
    """
    Save (or update) a Web Push subscription for the current user.
    Body: { subscription: <PushSubscription JSON from browser> }
    """
    uid  = int(get_jwt_identity())
    data = request.get_json() or {}
    sub  = data.get("subscription")

    if not sub or not sub.get("endpoint"):
        return jsonify({"error": "Invalid subscription object."}), 400

    endpoint = sub["endpoint"]

    # Upsert — update if the same endpoint already exists (key rotation)
    existing = PushSubscription.query.filter_by(endpoint=endpoint).first()
    if existing:
        existing.user_id           = uid
        existing.subscription_json = json.dumps(sub)
    else:
        db.session.add(PushSubscription(
            user_id=uid,
            subscription_json=json.dumps(sub),
            endpoint=endpoint,
        ))
    db.session.commit()
    return jsonify({"message": "Subscribed."}), 200


@push_bp.route("/push/unsubscribe", methods=["DELETE"])
@jwt_required()
def unsubscribe():
    """
    Remove a specific push subscription.
    Body: { endpoint: "https://..." }
    """
    uid      = int(get_jwt_identity())
    data     = request.get_json() or {}
    endpoint = data.get("endpoint")

    if not endpoint:
        return jsonify({"error": "Endpoint required."}), 400

    sub = PushSubscription.query.filter_by(user_id=uid, endpoint=endpoint).first()
    if sub:
        db.session.delete(sub)
        db.session.commit()
    return jsonify({"message": "Unsubscribed."}), 200
