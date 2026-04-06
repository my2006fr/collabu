"""
Push subscription management routes.

GET    /push/vapid-public-key  — return the VAPID public key for the browser SW
POST   /push/subscribe         — save a browser push subscription
DELETE /push/unsubscribe       — remove a push subscription by endpoint
"""
import os
import json
import base64
import logging

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.push_subscription import PushSubscription

push_bp = Blueprint("push", __name__)
logger  = logging.getLogger(__name__)


def _to_browser_public_key(raw_env_value: str) -> str:
    """
    The browser's PushManager.subscribe() needs the VAPID public key as a
    URL-safe base64-encoded *raw* uncompressed EC point (04 || x || y, 65 bytes → 87 base64 chars).

    If the key in .env is already in that format (87 chars, URL-safe), return as-is.
    If it's a DER SubjectPublicKeyInfo (91 bytes decoded, starts with 'MFkw'), extract the EC point.
    If it's a PEM block, strip headers and decode DER then extract.
    """
    key = raw_env_value.strip()

    # Remove PEM armor if present
    if "-----" in key:
        key = "".join(
            line for line in key.splitlines()
            if not line.startswith("-----")
        )

    # Decode — accept both standard and URL-safe base64
    try:
        key_std = key.replace("-", "+").replace("_", "/")
        padding = "=" * ((4 - len(key_std) % 4) % 4)
        decoded = base64.b64decode(key_std + padding)
    except Exception:
        logger.error("[push] VAPID_PUBLIC_KEY cannot be base64-decoded.")
        return ""

    if len(decoded) == 65:
        # Already a raw uncompressed EC point
        return base64.urlsafe_b64encode(decoded).rstrip(b"=").decode()

    if len(decoded) == 91:
        # DER SubjectPublicKeyInfo for P-256: fixed 26-byte header, then 65-byte EC point
        raw = decoded[26:]
        if len(raw) == 65:
            return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

    logger.error(
        "[push] VAPID_PUBLIC_KEY has unexpected decoded length %d. "
        "Run `python generate_vapid.py` to regenerate.",
        len(decoded),
    )
    return ""


@push_bp.route("/push/vapid-public-key", methods=["GET"])
def get_vapid_key():
    """Return the VAPID public key in the format the browser expects."""
    raw = os.getenv("VAPID_PUBLIC_KEY", "")
    if not raw:
        return jsonify({"error": "Push notifications not configured on this server."}), 503

    browser_key = _to_browser_public_key(raw)
    if not browser_key:
        return jsonify({"error": "VAPID public key is misconfigured. Check server logs."}), 503

    return jsonify({"public_key": browser_key}), 200


@push_bp.route("/push/subscribe", methods=["POST"])
@jwt_required()
def subscribe():
    """Save (or update) a Web Push subscription for the current user."""
    uid  = int(get_jwt_identity())
    data = request.get_json() or {}
    sub  = data.get("subscription")

    if not sub or not sub.get("endpoint"):
        return jsonify({"error": "Invalid subscription object."}), 400

    endpoint = sub["endpoint"]

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
    logger.info("[push] user %s subscribed endpoint %s…", uid, endpoint[:40])
    return jsonify({"message": "Subscribed."}), 200


@push_bp.route("/push/unsubscribe", methods=["DELETE"])
@jwt_required()
def unsubscribe():
    """Remove a specific push subscription."""
    uid      = int(get_jwt_identity())
    data     = request.get_json() or {}
    endpoint = data.get("endpoint")

    if not endpoint:
        return jsonify({"error": "Endpoint required."}), 400

    sub = PushSubscription.query.filter_by(user_id=uid, endpoint=endpoint).first()
    if sub:
        db.session.delete(sub)
        db.session.commit()
        logger.info("[push] user %s unsubscribed.", uid)
    return jsonify({"message": "Unsubscribed."}), 200
