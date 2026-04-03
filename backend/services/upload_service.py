import os, uuid
from PIL import Image
from flask import current_app
import cloudinary.uploader

ALLOWED_IMAGE       = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED_VIDEO       = {"mp4", "mov", "webm", "avi"}
ALLOWED_AUDIO       = {"mp3", "wav", "ogg", "m4a", "aac"}
ALLOWED_DOCUMENT    = {"pdf", "xlsx", "xls", "csv", "docx", "txt", "zip"}
ALLOWED_ALL         = ALLOWED_IMAGE | ALLOWED_VIDEO | ALLOWED_AUDIO | ALLOWED_DOCUMENT

def _ext(filename):
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

def _file_type(ext):
    if ext in ALLOWED_IMAGE:    return "image"
    if ext in ALLOWED_VIDEO:    return "video"
    if ext in ALLOWED_AUDIO:    return "audio"
    if ext == "pdf":            return "pdf"
    if ext in {"xlsx","xls","csv"}: return "spreadsheet"
    return "file"

def save_avatar(file) -> str:
    ext = _ext(file.filename)
    if ext not in ALLOWED_IMAGE:
        raise ValueError("Image files only (png, jpg, gif, webp)")
    fname  = f"{uuid.uuid4().hex}.{ext}"
    # folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "avatars")
    # os.makedirs(folder, exist_ok=True)
    folder = "avatars"
    img = Image.open(file)
    img.thumbnail((256, 256))
    # img.save(os.path.join(folder, fname))
    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(img, folder=folder, public_id=fname.rsplit(".",1)[0], overwrite=True)
    return upload_result["secure_url"]  

def save_file(file, subfolder="files") -> dict:
    """Generic file saver — returns metadata dict."""
    ext = _ext(file.filename)
    if ext not in ALLOWED_ALL:
        raise ValueError(f"File type .{ext} is not allowed")
    fname  = f"{uuid.uuid4().hex}.{ext}"
    # folder = os.path.join(current_app.config["UPLOAD_FOLDER"], subfolder)
    # os.makedirs(folder, exist_ok=True)
    folder = subfolder

    path   = os.path.join(folder, fname)
    result = cloudinary.uploader.upload(file, folder=folder, public_id=fname.rsplit(".",1)[0], overwrite=True)
    size   = os.path.getsize(path)
    return {
        "url":           result["secure_url"],
        "original_name": file.filename,
        "ext":           ext,
        "type":          _file_type(ext),
        "size":          size,
    }

def save_project_file(file):
    return save_file(file, subfolder="projects")

def save_chat_file(file):
    return save_file(file, subfolder="chat")

def save_post_file(file):
    return save_file(file, subfolder="posts")
