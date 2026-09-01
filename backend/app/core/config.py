"""
CodeSentinel Application Settings.

Loads configuration from environment variables and .env file.
"""

from __future__ import annotations

from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent  # project root


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---
    app_name: str = "CodeSentinel"
    app_env: str = "development"
    app_debug: bool = True
    app_secret_key: str = "change-me-to-a-random-64-char-string"
    app_base_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    # --- Database ---
    database_url: str = "sqlite+aiosqlite:///./codesentinel.db"
    database_echo: bool = False

    # --- Redis ---
    redis_url: str = "redis://localhost:6379/0"

    # --- GitHub OAuth ---
    github_client_id: str = ""
    github_client_secret: str = ""
    github_webhook_secret: str = ""
    github_redirect_uri: str = "http://localhost:8000/api/v1/auth/github/callback"

    # --- AI Provider (Gemini) ---
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    gemini_embedding_model: str = "text-embedding-004"

    # --- Scanners ---
    semgrep_enabled: bool = True
    gitleaks_enabled: bool = True
    scan_timeout_seconds: int = 600
    max_repo_size_mb: int = 500
    max_file_count: int = 10000

    # --- Security ---
    jwt_secret_key: str = "change-me-to-a-different-random-64-char-string"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    encryption_key: str = "change-me-32-byte-base64-encoded-key"

    # --- CORS ---
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # --- Rate Limiting ---
    rate_limit_auth: str = "10/minute"
    rate_limit_api: str = "100/minute"

    # --- Worker ---
    worker_concurrency: int = 2
    worker_queue_name: str = "codesentinel"

    @property
    def sync_database_url(self) -> str:
        """Return synchronous database URL for Alembic."""
        return self.database_url.replace("postgresql+asyncpg://", "postgresql://")


settings = Settings()
