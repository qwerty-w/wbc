from typing import Iterable
from sqlalchemy import select
from btclib import PrivateKey, NetworkType, AddressType

from ..database import SessionLocal
from ..models import User
from . import cryptoutils as cu
from .models import UserBitcoinKey, UserBitcoinAddress


async def get_addresses(userid: int) -> Iterable[UserBitcoinAddress]:
    async with SessionLocal() as session:
        return await session.scalars(select(UserBitcoinAddress).where(UserBitcoinAddress.userid == userid))


async def get_address_by_shortname(userid: int, shortname: str) -> UserBitcoinAddress | None:
    async with SessionLocal() as session:
        return await session.scalar(select(UserBitcoinAddress).where(UserBitcoinAddress.userid == userid, UserBitcoinAddress.shortname == shortname))


async def create_address(user: User,
                         userpassword: str,
                         type: AddressType,
                         network: NetworkType,
                         shortname: str,
                         emojid: str,
                         pubkey_compressed: bool,
                         p: PrivateKey | None = None) -> UserBitcoinAddress:

    p = p or PrivateKey(pubkey_network=network, pubkey_compressed=pubkey_compressed)
    rawp, rawpub = p.to_bytes(), p.public.key.to_string()
    pubx, puby = rawpub[:32], rawpub[32:]
    address = p.public.get_address(type)
    ck = cu.kdfdecrypt(userpassword, user.ckey_encrypted, user.kdf_options, user.kdf_digest)

    async with SessionLocal() as session:
        session.add(bkey := UserBitcoinKey(
            userid=user.id,
            encrypted=cu.encrypt(ck, rawp),
            dsha256_digest=cu.dsha256(rawp),
            pubkey_xb=pubx,
            pubkey_yb=puby
        ))
        await session.commit()

        session.add(baddr := UserBitcoinAddress(
            userid=user.id,
            string=address.string,
            type=address.type,
            network=address.network,
            is_pubkey_compressed=p.public.compressed,
            keyid=bkey.id,
            shortname=shortname,
            emojid=emojid
        ))
        await session.commit()
        return baddr
