from typing import cast, Iterable
from sqlalchemy import select, update, delete
from btclib import PrivateKey, NetworkType, AddressType

from ..database import SessionLocal
from ..crud import catch_unique
from ..models import User
from . import cryptoutils as cu
from .models import UserBitcoinKey, UserBitcoinAddress


async def get_address(userid: int, string: str) -> UserBitcoinAddress | None:
    async with SessionLocal() as session:
        return (await session.scalars(
            select(UserBitcoinAddress)
            .where(
                UserBitcoinAddress.userid == userid,
                UserBitcoinAddress.string == string
            )
        )).one()


async def get_addresses(userid: int) -> Iterable[UserBitcoinAddress]:
    async with SessionLocal() as session:
        return await session.scalars(
            select(UserBitcoinAddress)
            .where(
                UserBitcoinAddress.userid == userid
            )
        )


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
        pk = cast(UserBitcoinKey, (await session.scalars(
            select(UserBitcoinKey)
            .where(
                UserBitcoinKey.userid == user.id,
                UserBitcoinKey.dsha256_digest == pdigest
            )
        )).one())
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
        assert not await catch_unique(session.commit()), f"address '{address.string}' already exists"
        return address_bd


async def update_address(userid: int, address: str, shortname: str, emojid: str):
    async with SessionLocal() as session, session.begin():
        await session.execute(
            update(UserBitcoinAddress)
            .where(
                UserBitcoinAddress.userid == userid,
                UserBitcoinAddress.string == address
            )
            .values(
                shortname=shortname,
                emojid=emojid
            )
        )


async def delete_address(address: UserBitcoinAddress):
    async with SessionLocal() as session:
        await session.delete(address)

        anyaddress = await session.scalar(
            select(UserBitcoinAddress)
            .where(UserBitcoinAddress.keyid == address.keyid)
            .limit(1)
        )
        if not anyaddress:
            await session.execute(
                delete(UserBitcoinKey)
                .where(UserBitcoinKey.id == address.keyid)
            )

        await session.commit()
