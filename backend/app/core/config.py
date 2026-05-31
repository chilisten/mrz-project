from pydantic_settings import BaseSettings
from typing import Any


class Settings(BaseSettings):
    DATABASE_URL: str
    DB_SSL: bool = True

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    CORS_ORIGINS: str = "http://localhost:5173"

    AVIATIONSTACK_API_KEY: str = ""
    AVIATIONSTACK_BASE_URL: str = "http://api.aviationstack.com/v1"

    def get_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
