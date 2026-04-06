from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.post import Post, PostFile, PostLike, PostComment
from services.upload_service import save_file
from services.notification_service import notify
from models.notification import (
    NOTIF_POST_LIKED, NOTIF_POST_COMMENT, NOTIF_COMMENT_REPLY
)
from datetime import datetime
from socket_events import broadcast_global_post, broadcast_post_like, broadcast_post_comment

gp_bp = Blueprint("global_posts", __name__)

# ── Feed (all users) ──────────────────────────────────────────────────────────

@gp_bp.route("/feed", methods=["GET"])
@jwt_required()
def get_feed():
    uid      = int(get_jwt_identity())
    page     = request.args.get("page", 1, type=int)
    per_page = 15
    q        = Post.query.order_by(Post.created_at.desc())
    total    = q.count()
    posts    = q.offset((page-1)*per_page).limit(per_page).all()
    return jsonify({
        "posts": [p.to_dict(current_user_id=uid) for p in posts],
        "total": total, "page": page,
        "pages": (total + per_page - 1) // per_page,
    }), 200

# ── Create post ───────────────────────────────────────────────────────────────

@gp_bp.route("/feed", methods=["POST"])
@jwt_required()
def create_post():
    uid   = int(get_jwt_identity())
    body  = (request.form.get("body") or "").strip()
    files = request.files.getlist("files")
    if not body and not files:
        return jsonify({"error": "Post needs text or at least one file."}), 400
    post = Post(user_id=uid, body=body)
    db.session.add(post)
    db.session.flush()
    errors = []
    for f in files:
        if not f.filename: continue
        try:
            info = save_file(f, subfolder="posts")
            db.session.add(PostFile(post_id=post.id, file_url=info["url"],
                file_name=info["original_name"], file_type=info["type"], file_size=info["size"]))
        except ValueError as e:
            errors.append(str(e))
    db.session.commit()
    result = post.to_dict(current_user_id=uid)
    if errors: result["warnings"] = errors
    broadcast_global_post(result)
    return jsonify({"post": result}), 201

# ── Edit / delete ─────────────────────────────────────────────────────────────

@gp_bp.route("/feed/<int:pid>", methods=["PATCH"])
@jwt_required()
def edit_post(pid):
    uid  = int(get_jwt_identity())
    post = Post.query.get_or_404(pid)
    if post.user_id != uid:
        return jsonify({"error": "Not authorized."}), 403
    body = (request.get_json().get("body") or "").strip()
    if not body: return jsonify({"error": "Body required."}), 400
    post.body      = body
    post.edited_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"post": post.to_dict(current_user_id=uid)}), 200

@gp_bp.route("/feed/<int:pid>", methods=["DELETE"])
@jwt_required()
def delete_post(pid):
    uid  = int(get_jwt_identity())
    post = Post.query.get_or_404(pid)
    if post.user_id != uid:
        return jsonify({"error": "Not authorized."}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Deleted."}), 200

# ── Like / unlike ─────────────────────────────────────────────────────────────

@gp_bp.route("/feed/<int:pid>/like", methods=["POST"])
@jwt_required()
def toggle_like(pid):
    uid      = int(get_jwt_identity())
    existing = PostLike.query.filter_by(post_id=pid, user_id=uid).first()
    post     = Post.query.get_or_404(pid)

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"liked": False}), 200

    db.session.add(PostLike(post_id=pid, user_id=uid))
    db.session.commit()

    broadcast_post_like(pid, len(post.likes), uid)

    # Notify the post author (not if they liked their own post)
    if post.user_id != uid:
        from models.user import User
        liker = User.query.get(uid)
        snippet = post.body[:60] + ("…" if len(post.body) > 60 else "")
        notify(
            user_id=post.user_id,
            type=NOTIF_POST_LIKED,
            title=f"{liker.name} liked your post",
            body=f'"{snippet}"',
            link="/feed",
            actor_id=uid,
        )

    return jsonify({"liked": True}), 200

# ── Comments ──────────────────────────────────────────────────────────────────

@gp_bp.route("/feed/<int:pid>/comments", methods=["GET"])
@jwt_required()
def get_comments(pid):
    comments = PostComment.query.filter_by(post_id=pid, parent_id=None)\
                   .order_by(PostComment.created_at).all()
    return jsonify({"comments": [c.to_dict() for c in comments]}), 200

@gp_bp.route("/feed/<int:pid>/comments", methods=["POST"])
@jwt_required()
def add_comment(pid):
    uid  = int(get_jwt_identity())
    d    = request.get_json()
    body = (d.get("body") or "").strip()
    if not body: return jsonify({"error": "Body required."}), 400

    parent_id = d.get("parent_id")
    c = PostComment(post_id=pid, user_id=uid, body=body, parent_id=parent_id)
    db.session.add(c)
    db.session.commit()
    broadcast_post_comment(pid, c.to_dict())

    from models.user import User
    commenter = User.query.get(uid)
    post      = Post.query.get(pid)
    snippet   = body[:80] + ("…" if len(body) > 80 else "")

    if parent_id:
        # Reply to a comment — notify the parent comment author
        parent = PostComment.query.get(parent_id)
        if parent and parent.user_id != uid:
            notify(
                user_id=parent.user_id,
                type=NOTIF_COMMENT_REPLY,
                title=f"{commenter.name} replied to your comment",
                body=snippet,
                link="/feed",
                actor_id=uid,
            )
    elif post and post.user_id != uid:
        # Top-level comment — notify the post author
        notify(
            user_id=post.user_id,
            type=NOTIF_POST_COMMENT,
            title=f"{commenter.name} commented on your post",
            body=snippet,
            link="/feed",
            actor_id=uid,
        )

    return jsonify({"comment": c.to_dict()}), 201

@gp_bp.route("/feed/comments/<int:cid>", methods=["DELETE"])
@jwt_required()
def delete_comment(cid):
    uid = int(get_jwt_identity())
    c   = PostComment.query.get_or_404(cid)
    if c.user_id != uid: return jsonify({"error": "Not authorized."}), 403
    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Deleted."}), 200
