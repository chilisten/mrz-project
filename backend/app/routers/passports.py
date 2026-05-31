from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.passport import Passport
from app.schemas.passport import PassportIn, PassportOut  # ← из нового файла

router = APIRouter()


@router.post("/", response_model=PassportOut, status_code=201)
async def save_passport(
    body: PassportIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    passport = Passport(user_id=current_user.id, **body.model_dump())
    db.add(passport)
    await db.flush()
    await db.refresh(passport)
    return passport


@router.get("/", response_model=list[PassportOut])
async def list_passports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Passport)
        .where(Passport.user_id == current_user.id)
        .order_by(Passport.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/{passport_id}", status_code=204)
async def delete_passport(
    passport_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Passport).where(
            Passport.id == passport_id,
            Passport.user_id == current_user.id,
        )
    )
    passport = result.scalar_one_or_none()
    if not passport:
        raise HTTPException(status_code=404, detail="Паспорт не найден")
    await db.delete(passport)


@router.put("/{passport_id}", response_model=PassportOut)
async def update_passport(
    passport_id: int,
    body: PassportIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Passport).where(
            Passport.id == passport_id,
            Passport.user_id == current_user.id,
        )
    )
    passport = result.scalar_one_or_none()
    if not passport:
        raise HTTPException(status_code=404, detail="Паспорт не найден")

    for key, val in body.model_dump().items():
        setattr(passport, key, val)

    await db.flush()
    await db.refresh(passport)
    return passport