from datetime import date
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import asyncio
import logging

from app.core.database import get_db
from app.services.aviationstack import search_flights, generate_seatmap
from app.models.booking import Booking

router = APIRouter()
logger = logging.getLogger(__name__)

ALL_ROUTES = [
    ("FRU", "SVO"),
    ("FRU", "IST"),
    ("FRU", "ALA"),
    ("FRU", "DXB"),
    ("FRU", "PEK"),
    ("FRU", "DME"),
    ("FRU", "LED"),
    ("FRU", "NQZ"),
    ("FRU", "OVB"),
    ("FRU", "TAS"),
    ("ALA", "SVO"),
    ("ALA", "IST"),
]


class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    date: str
    adults: int = 1
    travel_class: str = "ECONOMY"


@router.get(
    "/all",
    summary="Лента всех рейсов",
    description="Публичный эндпоинт. Авторизация не требуется.",
)
async def get_all_flights():
    today = date.today().isoformat()

    async def fetch_route(orig, dest):
        try:
            return await search_flights(orig, dest, today)
        except Exception:
            return []

    results = await asyncio.gather(*[fetch_route(o, d) for o, d in ALL_ROUTES])

    seen = set()
    flights = []
    for batch in results:
        for f in batch:
            if f["id"] not in seen:
                seen.add(f["id"])
                flights.append(f)

    return {"data": flights, "count": len(flights)}


@router.post(
    "/search",
    summary="Поиск рейсов",
    description="Публичный эндпоинт. Авторизация не требуется.",
)
async def search(body: FlightSearchRequest):
    try:
        flights = await search_flights(
            origin=body.origin,
            destination=body.destination,
            flight_date=body.date,
        )
        return {"data": flights, "count": len(flights)}
    except Exception as e:
        logger.error(f"Flight search failed: {e}")
        raise HTTPException(status_code=502, detail=str(e))


@router.get(
    "/seatmap/{flight_id}",
    summary="Карта мест",
    description="Публичный эндпоинт. Реально забронированные места помечаются как занятые.",
)
async def seatmap(
    flight_id: str,
    aircraft: str = Query(default="Boeing 737-800"),
    economy_price: Optional[float] = Query(default=None),
    business_price: Optional[float] = Query(default=None),
    first_price: Optional[float] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    try:
        flight_data = {
            "id": flight_id,
            "aircraft": aircraft,
            "prices": {
                "economy":  economy_price,
                "business": business_price,
                "first":    first_price,
            }
        }
        data = generate_seatmap(flight_data)

        # Достаём реальные бронирования для этого рейса
        result = await db.execute(
            select(Booking).where(
                Booking.flight_id == flight_id,
                Booking.status != "cancelled",
            )
        )
        bookings = result.scalars().all()

        # Собираем занятые места
        booked_seats = set()
        for booking in bookings:
            for seat in (booking.seats or []):
                if seat.get("seat_id"):
                    booked_seats.add(seat["seat_id"])

        # Помечаем в карте
        if booked_seats:
            for row in data["rows"]:
                for col in row["cols"]:
                    if col["id"] in booked_seats:
                        col["taken"] = True
                        col["booked"] = True

        return {"data": data, "source": "generated"}
    except Exception as e:
        logger.error(f"Seatmap failed for {flight_id}: {e}")
        raise HTTPException(status_code=502, detail=str(e))