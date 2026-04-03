from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.project_post import ProjectPost, PostAttachment
from models.project import Project
from models.collaboration import Collaboration
from services.upload_service import save_post_file

posts_bp = Blueprint("posts", __name__)

def is_member(pid, uid):
    p = Project.query.get(pid)
    if not p: return False
    if p.owner_id == uid: return True
    return bool(Collaboration.query.filter_by(
        project_id=pid, user_id=uid, status="accepted").first())

# ── List posts ────────────────────────────────────────────────────────────────

@posts_bp.route("/projects/<int:pid>/posts", methods=["GET"])
@jwt_required()
def get_posts(pid):
    uid = int(get_jwt_identity())
    if not is_member(pid, uid):
        return jsonify({"error": "Not a project member."}), 403
    page     = request.args.get("page", 1, type=int)
    per_page = 20
    q        = ProjectPost.query.filter_by(project_id=pid)\
                 .order_by(ProjectPost.created_at.desc())
    total    = q.count()
    posts    = q.offset((page-1)*per_page).limit(per_page).all()
    return jsonify({
        "posts": [p.to_dict() for p in posts],
        "total": total,
        "page":  page,
        "pages": (total + per_page - 1) // per_page,
    }), 200

# ── Create post (text + multiple file attachments) ────────────────────────────

@posts_bp.route("/projects/<int:pid>/posts", methods=["POST"])
@jwt_required()
def create_post(pid):
    uid = int(get_jwt_identity())
    if not is_member(pid, uid):
        return jsonify({"error": "Not a project member."}), 403

    body  = (request.form.get("body") or "").strip()
    files = request.files.getlist("files")   # multiple files

    if not body and not files:
        return jsonify({"error": "Post needs text or at least one file."}), 400

    post = ProjectPost(project_id=pid, user_id=uid, body=body)
    db.session.add(post)
    db.session.flush()   # get post.id before attachments

    errors = []
    for f in files:
        if not f.filename:
            continue
        try:
            info = save_post_file(f)
            att  = PostAttachment(
                post_id   = post.id,
                file_url  = info["url"],
                file_name = info["original_name"],
                file_type = info["type"],
                file_size = info["size"],
            )
            db.session.add(att)
        except ValueError as e:
            errors.append(str(e))

    db.session.commit()
    result = post.to_dict()
    if errors:
        result["warnings"] = errors
    return jsonify({"post": result}), 201

# ── Delete post ───────────────────────────────────────────────────────────────

@posts_bp.route("/projects/<int:pid>/posts/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(pid, post_id):
    uid  = int(get_jwt_identity())
    post = ProjectPost.query.filter_by(id=post_id, project_id=pid).first_or_404()
    p    = Project.query.get(pid)
    if post.user_id != uid and p.owner_id != uid:
        return jsonify({"error": "Not authorized."}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted."}), 200

# ── Image gallery ─────────────────────────────────────────────────────────────

@posts_bp.route("/projects/<int:pid>/gallery", methods=["GET"])
@jwt_required()
def get_gallery(pid):
    uid = int(get_jwt_identity())
    if not is_member(pid, uid):
        return jsonify({"error": "Not a project member."}), 403
    images = PostAttachment.query\
        .join(ProjectPost)\
        .filter(ProjectPost.project_id == pid, PostAttachment.file_type == "image")\
        .order_by(PostAttachment.created_at.desc())\
        .all()
    return jsonify({"images": [i.to_dict() for i in images]}), 200
