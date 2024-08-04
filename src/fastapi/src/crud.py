from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from .database import SessionLocal
from .models import User


NoResultError = NoResultFound('No row was found when one was required')


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
