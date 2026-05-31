from pydantic import BaseModel
from datetime import datetime


class PassportIn(BaseModel):
    surname: str
    names: str
    doc_num: str
    country: str
    dob: str
    sex: str
    expiry: str
    label: str | None = None


class PassportOut(BaseModel):
    id: int
    surname: str
    names: str
    doc_num: str
    country: str
    dob: str
    sex: str
    expiry: str
    label: str | None
    created_at: datetime

    model_config = {"from_attributes": True}