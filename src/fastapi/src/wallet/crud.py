from sqlalchemy import select
from ..database import SessionLocal
from ..models import User
from .models import UserBitcoinAddress


async def get_addresses(userid: int):
    async with SessionLocal() as session:
        return await session.scalars(select(UserBitcoinAddress).where(UserBitcoinAddress.userid == userid))
