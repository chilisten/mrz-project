from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Any


class PassengerIn(BaseModel):
    surname: str
    names: str
    doc_num: str
    country: str
    dob: str
    sex: str
    expiry: str


class SeatIn(BaseModel):
    seat_id: str
    seat_class: str
    passenger_index: int


class CreateBookingRequest(BaseModel):
    flight_id: str
    flight_data: dict[str, Any]
    passengers: list[PassengerIn]
    seats: list[SeatIn]
    total_price: Decimal
    currency: str = "KGS"


class BookingOut(BaseModel):
    id: int
    flight_id: str
    flight_data: dict[str, Any]
    passengers: list[Any]
    seats: list[Any]
    total_price: Decimal
    currency: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}