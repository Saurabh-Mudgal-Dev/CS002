from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "mysql+pymysql://resourceone:change-me@127.0.0.1:3306/resourceone?charset=utf8mb4"
    JWT_SECRET: str = "replace-with-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_HOURS: int = 8
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:8080"
    SEED_DEMO: int = 1
    LOG_LEVEL: str = "INFO"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, v, info):
        env = info.data.get("ENVIRONMENT", "development") if hasattr(info, "data") else "development"
        if env != "development" and ("replace-with" in v or len(v) < 16):
            raise ValueError("JWT_SECRET must be securely set in non-development environment")
        return v


settings = Settings()
