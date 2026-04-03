"""
Symmetric encryption for sensitive fields (GitHub PATs).
Uses Fernet (AES-128-CBC + HMAC-SHA256) from the cryptography library.

Generate a key once and store it in ENCRYPTION_KEY env var:
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
"""
import os
from cryptography.fernet import Fernet, InvalidToken

_fern = None

def _get_fernet() -> Fernet:
    global _fern
    if _fern:
        return _fern
    key = os.getenv("ENCRYPTION_KEY", "")
    if not key:
        # In development without a key set, use a fixed dev key so the app
        # still starts. NEVER deploy to production without setting ENCRYPTION_KEY.
        import warnings
        warnings.warn(
            "ENCRYPTION_KEY is not set — using insecure dev key. "
            "Set ENCRYPTION_KEY in production!",
            RuntimeWarning,
            stacklevel=2,
        )
        key = "dev-key-not-secure-do-not-use-in-prod-000="
        # Pad to valid Fernet key length
        from cryptography.fernet import Fernet as F
        key = F.generate_key().decode()
        os.environ["ENCRYPTION_KEY"] = key   # cache so we reuse same key this session
    _fern = Fernet(key.encode() if isinstance(key, str) else key)
    return _fern

def encrypt(plaintext: str) -> str:
    """Encrypt a string and return a base64 token string."""
    if not plaintext:
        return ""
    return _get_fernet().encrypt(plaintext.encode()).decode()

def decrypt(token: str) -> str:
    """Decrypt a Fernet token back to plaintext. Returns '' on failure."""
    if not token:
        return ""
    try:
        return _get_fernet().decrypt(token.encode()).decode()
    except (InvalidToken, Exception):
        return ""
