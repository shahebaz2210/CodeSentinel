"""Unit tests for Authentication and Security utilities."""

from backend.app.core.security import (
    create_jwt_token,
    decode_jwt_token,
    decrypt_value,
    encrypt_value,
    verify_webhook_signature,
)


def test_jwt_encode_decode():
    payload = {"sub": "user_123", "email": "dev@codesentinel.io", "role": "OWNER"}
    token = create_jwt_token(payload, expires_hours=1)
    assert token is not None
    assert isinstance(token, str)

    decoded = decode_jwt_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_123"
    assert decoded["email"] == "dev@codesentinel.io"
    assert decoded["role"] == "OWNER"


def test_jwt_invalid_token():
    decoded = decode_jwt_token("invalid.token.here")
    assert decoded is None


def test_token_encryption_decryption():
    secret_token = "ghp_1234567890abcdefghijklmnopqrstuvwxyz"
    encrypted = encrypt_value(secret_token)
    assert encrypted != secret_token
    assert isinstance(encrypted, str)

    decrypted = decrypt_value(encrypted)
    assert decrypted == secret_token


def test_webhook_hmac_verification():
    import hmac
    import hashlib

    secret = "test_webhook_secret_key"
    payload = b'{"action": "opened", "pull_request": {"number": 42}}'
    signature_hash = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    signature_header = f"sha256={signature_hash}"

    # Valid signature
    assert verify_webhook_signature(payload, signature_header, secret) is True

    # Invalid signature
    assert verify_webhook_signature(payload, "sha256=invalid_hash", secret) is False

    # Tampered payload
    tampered_payload = b'{"action": "closed"}'
    assert verify_webhook_signature(tampered_payload, signature_header, secret) is False
