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
        asyncpgerr = getattr(getattr(e, 'orig'), '__cause__')
        if not isinstance(asyncpgerr, UniqueViolationError):
            raise e
        return True


def _freturn[T](o: T | None) -> T:
    if o is None:
        raise NoResultError
    return o


async def getuser(id: int) -> User | None:
    async with SessionLocal() as session:
        return await session.get(User, id)


async def fetchuser(id: int) -> User:
    return _freturn(await getuser(id))


async def getuser_by_username(username: str) -> User | None:
    async with SessionLocal() as session:
        return await session.scalar(select(User).where(User.username == username))
