from typing import Iterable, Sequence
from sqlalchemy import select, update, delete, case, Select, tuple_
from sqlalchemy.orm import selectinload
from sqlalchemy.dialects.postgresql import insert
from btclib import BroadcastedTransaction, Unspent

from ..database import SessionLocal
from . import models


def select_transaction_query(
    *,
    load_inout: bool = True,
    load_unspent: bool = True
) -> Select[tuple[models.Transaction]]:
    q = select(models.Transaction)
    if load_inout:
        q = q.options(
            selectinload(models.Transaction.inputs),
            selectinload(models.Transaction.outputs)
        )
    if load_unspent:
        q = q.options(
            selectinload(models.Transaction.unspent)
        )
    return q


async def get_transaction(
    txid: bytes,
    load_inout: bool = True,
    load_unspent: bool = True
) -> models.Transaction | None:
    q = select_transaction_query(load_inout=load_inout, load_unspent=load_unspent).where(
        models.Transaction.id == txid
    )
    async with SessionLocal() as session:
        return (await session.scalars(q)).unique().one_or_none()


async def find_transactions(
    txids: Iterable[bytes],
    load_inout: bool = True,
    load_unspent: bool = True
) -> Sequence[models.Transaction]:
    """
    Get cached transactions and pass those that don't exist
    """
    q = select_transaction_query(load_inout=load_inout, load_unspent=load_unspent).where(
        models.Transaction.id.in_(txids)
    )
    async with SessionLocal() as session:
        return (await session.scalars(q)).unique().all()  # fixme: session.scalars() is too slow


async def add_transaction(tx: BroadcastedTransaction, apiservice: str) -> models.Transaction:
    async with SessionLocal() as session, session.begin():
        txmodel = models.Transaction.from_instance(tx, apiservice)
        session.add(txmodel)
    return txmodel


async def get_unspent(address: str) -> list[models.Unspent] | None:
    async with SessionLocal() as session:
        return list(await session.scalars(
            select(models.Unspent)
            .where(models.Unspent.address == address)
        ))


async def add_unspent(txid: bytes, vout: int, amount: int, addresstr: str) -> models.Unspent:
    async with SessionLocal() as session, session.begin():
        u = models.Unspent(
            txid=txid,
            vout=vout,
            amount=amount,
            addresstr=addresstr
        )
        session.add(u)
        return u


async def put_unspent(addresstr: str, unspent: list[Unspent]) -> None:
    async with SessionLocal() as session, session.begin():
        # delete those address unspent that are not in unspent list
        await session.execute(
            delete(models.Unspent)
            .where(
                models.Unspent.address == addresstr,
                tuple_(models.Unspent.txid, models.Unspent.vout).not_in((u.txid, u.vout) for u in unspent)
            )
        )
        # add those unspent that are not in db
        await session.execute(
            insert(models.Unspent)
            .values([(u.txid, u.vout, u.amount, u.address.string) for u in unspent])
            .on_conflict_do_nothing()
        )
    # second way
    # async with SessionLocal() as session, session.begin():
    #     await session.execute(delete(models.Unspent).where(models.Unspent.address == addresstr))
    #     session.add_all(models.Unspent.from_instance(u) for u in unspent)


async def add_transactions(
    transactions: list[BroadcastedTransaction],
    apiservice: str
) -> list[models.Transaction]:
    r: list[models.Transaction] = []
    async with SessionLocal() as session, session.begin():
        for tx in transactions:
            session.add(txmodel := models.Transaction.from_instance(tx, apiservice))
            r.append(txmodel)
    return r


async def update_transactions_blockheight(heights: dict[bytes, int]):
    async with SessionLocal() as session, session.begin():
        await session.execute(
            update(models.Transaction)
            .where(models.Transaction.id.in_(heights.keys()))
            .values(blockheight=case(
                heights,
                value=models.Transaction.id,
                else_=models.Transaction.id
            ))
        )
