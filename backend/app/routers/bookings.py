from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.booking import Booking
from app.schemas.booking import CreateBookingRequest, BookingOut

router = APIRouter()


@router.post("/", response_model=BookingOut, status_code=201)
async def create_booking(
    body: CreateBookingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = Booking(
        user_id=current_user.id,
        flight_id=body.flight_id,
        flight_data=body.flight_data,
        passengers=[p.model_dump() for p in body.passengers],
        seats=[s.model_dump() for s in body.seats],
        total_price=body.total_price,
        currency=body.currency,
        status="confirmed",
    )
    db.add(booking)
    await db.flush()
    await db.refresh(booking)
    return booking


@router.get("/", response_model=list[BookingOut])
async def list_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id, Booking.user_id == current_user.id)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Бронирование не найдено")
    return booking


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id, Booking.user_id == current_user.id)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Бронирование не найдено")
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Бронирование уже отменено")

    booking.status = "cancelled"
    await db.flush()
    await db.refresh(booking)
    return booking
