from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.chat_message import ChatMessage
from models.project import Project
from models.collaboration import Collaboration
from services.upload_service import save_file
from socket_events import broadcast_chat_message
from datetime import datetime

chat_bp = Blueprint("chat", __name__)

def is_member(pid, uid):
    p = Project.query.get(pid)
    if not p: return False
    if p.owner_id == uid: return True
    return bool(Collaboration.query.filter_by(project_id=pid, user_id=uid, status="accepted").first())

@chat_bp.route("/projects/<int:pid>/chat", methods=["GET"])
@jwt_required()
def get_messages(pid):
    uid = int(get_jwt_identity())
    if not is_member(pid, uid): return jsonify({"error": "Not a project member."}), 403
    page     = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 40, type=int)
    q        = ChatMessage.query.filter_by(project_id=pid, parent_id=None).order_by(ChatMessage.created_at.desc())
    total    = q.count()
    messages = q.offset((page-1)*per_page).limit(per_page).all()
    messages.reverse()
    return jsonify({"messages": [m.to_dict() for m in messages], "total": total,
                    "page": page, "pages": (total+per_page-1)//per_page}), 200

@chat_bp.route("/projects/<int:pid>/chat", methods=["POST"])
@jwt_required()
def send_message(pid):
    uid = int(get_jwt_identity())
    if not is_member(pid, uid): return jsonify({"error": "Not a project member."}), 403
    d         = request.get_json()
    body      = (d.get("body") or "").strip()
    parent_id = d.get("parent_id")
    if not body: return jsonify({"error": "Message body is required."}), 400
    if parent_id:
        parent = ChatMessage.query.get(parent_id)
        if not parent or parent.project_id != pid:
            return jsonify({"error": "Invalid parent message."}), 400
    msg = ChatMessage(project_id=pid, user_id=uid, body=body, parent_id=parent_id)
    db.session.add(msg)
    db.session.commit()
    msg_dict = msg.to_dict()
    broadcast_chat_message(pid, msg_dict)          # ← real-time
    return jsonify({"message": msg_dict}), 201

@chat_bp.route("/projects/<int:pid>/chat/file", methods=["POST"])
@jwt_required()
def send_file_message(pid):
    uid = int(get_jwt_identity())
    if not is_member(pid, uid): return jsonify({"error": "Not a project member."}), 403
    if "file" not in request.files: return jsonify({"error": "No file provided."}), 400
    body      = (request.form.get("body") or "").strip()
    parent_id = request.form.get("parent_id", type=int)
    try:
        info = save_file(request.files["file"], subfolder="chat")
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if parent_id:
        parent = ChatMessage.query.get(parent_id)
        if not parent or parent.project_id != pid:
            return jsonify({"error": "Invalid parent message."}), 400
    msg = ChatMessage(project_id=pid, user_id=uid, body=body, parent_id=parent_id,
                      file_url=info["url"], file_name=info["original_name"],
                      file_type=info["type"], file_size=info["size"])
    db.session.add(msg)
    db.session.commit()
    msg_dict = msg.to_dict()
    broadcast_chat_message(pid, msg_dict)          # ← real-time
    return jsonify({"message": msg_dict}), 201

@chat_bp.route("/projects/<int:pid>/chat/<int:mid>", methods=["PATCH"])
@jwt_required()
def edit_message(pid, mid):
    uid = int(get_jwt_identity())
    msg = ChatMessage.query.filter_by(id=mid, project_id=pid).first_or_404()
    if msg.user_id != uid: return jsonify({"error": "Not authorized."}), 403
    body = (request.get_json().get("body") or "").strip()
    if not body: return jsonify({"error": "Body required."}), 400
    msg.body = body; msg.edited_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": msg.to_dict()}), 200

@chat_bp.route("/projects/<int:pid>/chat/<int:mid>", methods=["DELETE"])
@jwt_required()
def delete_message(pid, mid):
    uid = int(get_jwt_identity())
    msg = ChatMessage.query.filter_by(id=mid, project_id=pid).first_or_404()
    p   = Project.query.get(pid)
    if msg.user_id != uid and p.owner_id != uid: return jsonify({"error": "Not authorized."}), 403
    db.session.delete(msg)
    db.session.commit()
    return jsonify({"message": "Deleted."}), 200
