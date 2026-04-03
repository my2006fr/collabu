"""
Flask-SocketIO event handlers.
Rooms:
  - project_{pid}  : real-time chat + join-request notifications
  - global_feed    : global post notifications
"""
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_jwt_extended import decode_token

# Do NOT pass the app here — it is wired up later via socketio.init_app(app) in app.py.
# async_mode must match the monkey-patch at the top of app.py (eventlet).
socketio = SocketIO(async_mode="eventlet", logger=False, engineio_logger=False)


def _user_id_from_token(token: str):
    """Decode JWT and return user id, or None if invalid."""
    try:
        data = decode_token(token)
        return int(data["sub"])
    except Exception:
        return None


@socketio.on("connect")
def on_connect(auth):
    token   = (auth or {}).get("token", "")
    user_id = _user_id_from_token(token)
    if not user_id:
        return False   # reject unauthenticated connections
    emit("connected", {"user_id": user_id})


@socketio.on("join_project_room")
def on_join_project(data):
    pid = data.get("project_id")
    if pid:
        join_room(f"project_{pid}")


@socketio.on("leave_project_room")
def on_leave_project(data):
    pid = data.get("project_id")
    if pid:
        leave_room(f"project_{pid}")


@socketio.on("join_global_feed")
def on_join_global(data):
    join_room("global_feed")


# ── Broadcast helpers (called from HTTP route handlers) ───────────────────────

def broadcast_chat_message(pid, message_dict):
    socketio.emit("new_chat_message", message_dict, room=f"project_{pid}")

def broadcast_join_request(pid, collab_dict):
    socketio.emit("new_join_request", collab_dict, room=f"project_{pid}")

def broadcast_project_post(pid, post_dict):
    socketio.emit("new_project_post", post_dict, room=f"project_{pid}")

def broadcast_global_post(post_dict):
    socketio.emit("new_global_post", post_dict, room="global_feed")

def broadcast_post_like(post_id, likes_count, liked_by_uid):
    socketio.emit("post_liked",
                  {"post_id": post_id, "likes_count": likes_count, "liked_by": liked_by_uid},
                  room="global_feed")

def broadcast_post_comment(post_id, comment_dict):
    socketio.emit("new_post_comment",
                  {"post_id": post_id, "comment": comment_dict},
                  room="global_feed")
