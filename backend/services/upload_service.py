import uuid
from flask import current_app
import cloudinary
import cloudinary.uploader

ALLOWED_IMAGE    = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED_VIDEO    = {"mp4", "mov", "webm", "avi"}
ALLOWED_AUDIO    = {"mp3", "wav", "ogg", "m4a", "aac"}
ALLOWED_DOCUMENT = {"pdf", "xlsx", "xls", "csv", "docx", "txt", "zip"}
ALLOWED_ALL      = ALLOWED_IMAGE | ALLOWED_VIDEO | ALLOWED_AUDIO | ALLOWED_DOCUMENT

def _ext(filename):
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

def _file_type(ext):
    if ext in ALLOWED_IMAGE:          return "image"
    if ext in ALLOWED_VIDEO:          return "video"
    if ext in ALLOWED_AUDIO:          return "audio"
    if ext == "pdf":                  return "pdf"
    if ext in {"xlsx", "xls", "csv"}: return "spreadsheet"
    return "file"

def _resource_type(ext):
    """Tell Cloudinary which resource type to use."""
    if ext in ALLOWED_IMAGE:   return "image"
    if ext in ALLOWED_VIDEO:   return "video"
    if ext in ALLOWED_AUDIO:   return "video"  # Cloudinary treats audio as video
    return "raw"                               # documents, zip, etc.

def save_avatar(file) -> str:
    ext = _ext(file.filename)
    if ext not in ALLOWED_IMAGE:
        raise ValueError("Image files only (png, jpg, gif, webp)")

    public_id = f"avatars/{uuid.uuid4().hex}"

    upload_result = cloudinary.uploader.upload(
        file,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
        transformation=[{"width": 256, "height": 256, "crop": "fill", "gravity": "face"}]
    )
    return upload_result["secure_url"]


def save_file(file, subfolder="files") -> dict:
    """Generic file saver — returns metadata dict."""
    ext = _ext(file.filename)
    if ext not in ALLOWED_ALL:
        raise ValueError(f"File type .{ext} is not allowed")

    public_id     = f"{subfolder}/{uuid.uuid4().hex}"
    resource_type = _resource_type(ext)

    upload_result = cloudinary.uploader.upload(
        file,
        public_id=public_id,
        overwrite=True,
        resource_type=resource_type,
        # Keep original filename as display name via context
        context={"original_name": file.filename}
    )

    return {
        "url":           upload_result["secure_url"],
        "public_id":     upload_result["public_id"],
        "original_name": file.filename,
        "ext":           ext,
        "type":          _file_type(ext),
        "size":          upload_result.get("bytes", 0),
        "resource_type": resource_type
    }


def save_project_file(file):
    return save_file(file, subfolder="projects")

def save_chat_file(file):
    return save_file(file, subfolder="chat")

def save_post_file(file):
    return save_file(file, subfolder="posts")


def delete_file(public_id: str, resource_type: str = "image") -> bool:
    """Delete a file from Cloudinary by public_id."""
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result.get("result") == "ok"
    except Exception as e:
        current_app.logger.error(f"Cloudinary delete error: {e}")
        return False