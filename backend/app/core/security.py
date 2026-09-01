"""
Security utilities: JWT, encryption, hashing.

Never log tokens, credentials, or decrypted secrets.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from cryptography.fernet import Fernet
from jose import JWTError, jwt

from backend.app.core.config import settings


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

def create_jwt_token(data: dict[str, Any], expires_hours: int | None = None) -> str:
    """Create a signed JWT token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        hours=expires_hours or settings.jwt_expiration_hours
    )
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_jwt_token(token: str) -> dict[str, Any] | None:
    """Decode and verify a JWT token. Returns None if invalid."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        return None


# ---------------------------------------------------------------------------
# Encryption (for GitHub tokens, credentials)
# ---------------------------------------------------------------------------

def _get_fernet() -> Fernet:
    """Get Fernet cipher from encryption key, deriving 32-byte urlsafe key if needed."""
    raw_key = settings.encryption_key.encode("utf-8")
    # Derive deterministic 32-byte hash and base64-encode it for Fernet
    digest = hashlib.sha256(raw_key).digest()
    fernet_key = base64.urlsafe_b64encode(digest)
    return Fernet(fernet_key)


def encrypt_value(plaintext: str) -> str:
    """Encrypt a string value. Returns base64-encoded ciphertext."""
    f = _get_fernet()
    return f.encrypt(plaintext.encode()).decode()


def decrypt_value(ciphertext: str) -> str:
    """Decrypt a previously encrypted value."""
    f = _get_fernet()
    return f.decrypt(ciphertext.encode()).decode()


# ---------------------------------------------------------------------------
# HMAC Verification (for GitHub webhooks)
# ---------------------------------------------------------------------------

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify GitHub webhook HMAC-SHA256 signature."""
    if not signature.startswith("sha256="):
        return False
    expected = hmac.new(
        secret.encode(), payload, hashlib.sha256
    ).hexdigest()
    received = signature[7:]  # strip "sha256="
    return hmac.compare_digest(expected, received)


# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------

def generate_secret(length: int = 32) -> str:
    """Generate a cryptographically secure random string."""
    return secrets.token_urlsafe(length)
