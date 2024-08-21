from typing import Any, Coroutine
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound, IntegrityError
from asyncpg.exceptions import UniqueViolationError

from .database import SessionLocal
from .models import User


NoResultError = NoResultFound('No row was found when one was required')


async def catch_unique[T](f: Coroutine[Any, Any, T]) -> bool:
    try:
        await f
        return False
    except IntegrityError as e:
        asyncpgerr = getattr(getattr(e, 'orig', None), '__cause__', None)
        if not isinstance(asyncpgerr, UniqueViolationError):
            raise e
        return True


async def getuser(id: int) -> User | None:
    async with SessionLocal() as session:
        return await session.get(User, id)


async def getuser_by_username(username: str) -> User | None:
    async with SessionLocal() as session:
        return (await session.scalars(
            select(User)
            .where(User.username == username)
        )).one_or_none()
