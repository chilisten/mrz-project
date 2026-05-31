from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, ForeignKey, JSON, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal

from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    flight_id: Mapped[str] = mapped_column(String(100), nullable=False)
    flight_data: Mapped[dict] = mapped_column(JSON, nullable=False)

    passengers: Mapped[list] = mapped_column(JSON, nullable=False)
    seats: Mapped[list] = mapped_column(JSON, default=list)

    total_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="KGS")

    # pending | confirmed | cancelled
    status: Mapped[str] = mapped_column(String(20), default="confirmed")

    # Переименовано: было amadeus_order_id
    external_order_id: Mapped[str | None] = mapped_column(String(200), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="bookings")