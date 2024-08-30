from typing import Iterable, Sequence, overload
from sqlalchemy import select, update, Select, tuple_, case
from sqlalchemy.orm import joinedload
from btclib import BroadcastedTransaction, Unspent

from ..database import SessionLocal
from . import models


def select_transaction_query(
    *,
    load_inout: bool = True,
    load_unspent: bool = True
) -> Select[tuple[models.BroadcastedTransaction]]:
    q = select(models.BroadcastedTransaction)
    if load_inout:
        q = q.options(
            joinedload(models.BroadcastedTransaction.inputs),
            joinedload(models.BroadcastedTransaction.outputs)
        )
    if load_unspent:
        q = q.options(
            joinedload(models.BroadcastedTransaction.unspent)
        )
    return q


async def get_transaction(
    txid: bytes,
    load_inout: bool = True,
    load_unspent: bool = True
) -> models.BroadcastedTransaction | None:
    q = select_transaction_query(load_inout=load_inout, load_unspent=load_unspent).where(
        models.BroadcastedTransaction.id == txid
    )
    async with SessionLocal() as session:
        return (await session.scalars(q)).one_or_none()


async def find_transactions(
    txids: Iterable[bytes],
    load_inout: bool = True,
    load_unspent: bool = True
) -> Sequence[models.BroadcastedTransaction]:
    """
    Get cached transactions and pass those that don't exist
    """
    q = select_transaction_query(load_inout=load_inout, load_unspent=load_unspent).where(
        models.BroadcastedTransaction.id.in_(txids)
    )
    async with SessionLocal() as session:
        return (await session.scalars(q)).unique().all()


async def add_transaction(tx: BroadcastedTransaction, apiservice: str) -> models.BroadcastedTransaction:
    async with SessionLocal() as session, session.begin():
        txmodel = models.BroadcastedTransaction.from_instance(tx, apiservice)
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


# @overload
# async def add_transactions(
#     transactions: list[BroadcastedTransaction],
#     apiservice: str,
#     with_unspent: None = None,
# ) -> list[models.BroadcastedTransaction]:
#     ...
# @overload
# async def add_transactions(
#     transactions: list[BroadcastedTransaction],
#     apiservice: str,
#     with_unspent: dict[bytes, list[Unspent]],
# ) -> tuple[
#     list[models.BroadcastedTransaction],
#     dict[bytes, list[models.Unspent]]
# ]:
#     ...
async def add_transactions(
    transactions: list[BroadcastedTransaction],
    apiservice: str,
    with_unspent: dict[bytes, list[Unspent]] | None = None,
) -> list[models.BroadcastedTransaction]:

    r: list[models.BroadcastedTransaction] = []
    async with SessionLocal() as session, session.begin():
        for tx in transactions:
            txmodel = models.BroadcastedTransaction.from_instance(tx, apiservice)

            if with_unspent and (uns := with_unspent.get(tx.id)):
                for u in uns:
                    umodel = models.Unspent.from_instance(u)
                    txmodel.unspent.append(umodel)  # fixme: doesnt append cuz viewonly=True

            r.append(txmodel)
            session.add(txmodel)
    return r


async def update_transactions_blockheight(heights: dict[bytes, int]):
    async with SessionLocal() as session, session.begin():
        await session.execute(
            update(models.BroadcastedTransaction)
            .where(models.BroadcastedTransaction.id.in_(heights.keys()))
            .values(blockheight=case(
                heights,
                value=models.BroadcastedTransaction.id,
                else_=models.BroadcastedTransaction.id
            ))
        )
