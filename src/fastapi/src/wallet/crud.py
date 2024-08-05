from typing import Iterable, cast
from sqlalchemy import select
from btclib import PrivateKey, NetworkType, AddressType

from ..database import SessionLocal
from ..crud import catch_unique
from ..models import User
from . import cryptoutils as cu
from .models import UserBitcoinKey, UserBitcoinAddress


async def get_addresses(userid: int) -> Iterable[UserBitcoinAddress]:
    async with SessionLocal() as session:
        return await session.scalars(select(UserBitcoinAddress).where(UserBitcoinAddress.userid == userid))


async def get_address_by_shortname(userid: int, shortname: str) -> UserBitcoinAddress | None:
    async with SessionLocal() as session:
        return await session.scalar(
            select(UserBitcoinAddress)
            .where(
                UserBitcoinAddress.userid == userid,
                UserBitcoinAddress.shortname == shortname
            )
        )


async def add_or_get_pkey(user: User, userpassword: str, p: PrivateKey):
    rawp = p.to_bytes()
    pdigest = cu.dsha256(rawp)

    async with SessionLocal() as session:
        pk = cast(UserBitcoinKey, await session.scalar(
            select(UserBitcoinKey)
            .where(
                UserBitcoinKey.userid == user.id,
                UserBitcoinKey.dsha256_digest == pdigest
            )
        ))
        if pk:
            return pk

    rawpub = p.public.key.to_string()
    pubx, puby = rawpub[:32], rawpub[32:]
    ck = cu.kdfdecrypt(userpassword, user.ckey_encrypted, user.kdf_options, user.kdf_digest)

    async with SessionLocal() as session, session.begin():
        session.add(pk := UserBitcoinKey(
            userid=user.id,
            encrypted=cu.encrypt(ck, rawp),
            dsha256_digest=pdigest,
            pubkey_xb=pubx,
            pubkey_yb=puby
        ))
        return pk


async def create_address(user: User,
                         userpassword: str,
                         type: AddressType,
                         network: NetworkType,
                         shortname: str,
                         emojid: str,
                         pubkey_compressed: bool,
                         p: PrivateKey | None = None) -> UserBitcoinAddress:

    p = p or PrivateKey(pubkey_network=network, pubkey_compressed=pubkey_compressed)
    p_bd = await add_or_get_pkey(user, userpassword, p)
    address = p.public.get_address(type)

    async with SessionLocal() as session:
        session.add(address_bd := UserBitcoinAddress(
            userid=user.id,
            string=address.string,
            type=address.type,
            network=address.network,
            is_pubkey_compressed=p.public.compressed,
            keyid=p_bd.id,
            shortname=shortname,
            emojid=emojid
        ))
        assert not await catch_unique(session.commit()), f'address "{address.string}" already exists'
        return address_bd
