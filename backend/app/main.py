from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import logging

from app.core.config import settings
from app.core.database import engine
from app.core.limiter import limiter
from app.models import user, booking, passport, refresh_token
from app.routers import auth, flights, bookings, passports

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Применяем миграции при старте
    try:
        from alembic.config import Config
        from alembic import command
        import asyncio

        alembic_cfg = Config("alembic.ini")
        await asyncio.get_event_loop().run_in_executor(
            None, command.upgrade, alembic_cfg, "head"
        )
        logger.info("✅ Migrations applied")
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")

    # Проверка подключения к БД
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection OK")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")

    yield
    await engine.dispose()
    logger.info("Database pool closed")


app = FastAPI(
    title="AirBook API",
    description="Backend for AirBook — MRZ Smart Booking",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # ← из settings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",      tags=["auth"])
app.include_router(flights.router,   prefix="/api/flights",   tags=["flights"])
app.include_router(bookings.router,  prefix="/api/bookings",  tags=["bookings"])
app.include_router(passports.router, prefix="/api/passports", tags=["passports"])


@app.get("/api/health", tags=["system"])
async def health():
    return {"status": "ok", "version": "1.0.0"}