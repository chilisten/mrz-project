from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Passport(Base):
    __tablename__ = "passports"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    # MRZ-parsed fields
    surname: Mapped[str] = mapped_column(String(100), nullable=False)
    names: Mapped[str] = mapped_column(String(100), nullable=False)
    doc_num: Mapped[str] = mapped_column(String(20), nullable=False)
    country: Mapped[str] = mapped_column(String(5), nullable=False)
    dob: Mapped[str] = mapped_column(String(10), nullable=False)      # DD.MM.YYYY
    sex: Mapped[str] = mapped_column(String(1), nullable=False)
    expiry: Mapped[str] = mapped_column(String(10), nullable=False)   # DD.MM.YYYY

    # Label for display (e.g. "Основной паспорт")
    label: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="passports")
