import bcrypt, os

ALLOWED_DOMAIN = os.getenv("ALLOWED_DOMAIN", "university.edu")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def is_allowed_email(email: str) -> bool:
    return email.strip().lower().endswith(f"@{ALLOWED_DOMAIN}")

def skills_match(user_skills: str, required_skills: str) -> list:
    """Return list of skills that overlap between user and project requirements."""
    if not required_skills:
        return []
    u = {s.strip().lower() for s in user_skills.split(",") if s.strip()}
    r = {s.strip().lower() for s in required_skills.split(",") if s.strip()}
    return list(u & r)
