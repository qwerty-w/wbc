from typing import Iterable, Sequence
from sqlalchemy import select, update, delete, case, Select, tuple_
from sqlalchemy.orm import selectinload
from sqlalchemy.dialects.postgresql import insert
from btclib import BroadcastedTransaction, Unspent

from ..database import SessionLocal
from . import models


def select_transaction_statement(
    *,
    load_inout: bool = True,
    load_unspent: bool = True
) -> Select[tuple[models.Transaction]]:
    stmt = select(models.Transaction)
    if load_inout:
        stmt = stmt.options(
            selectinload(models.Transaction.inputs),
            selectinload(models.Transaction.outputs)
        )
    if load_unspent:
        stmt = stmt.options(
            selectinload(models.Transaction.unspent)
        )
    return stmt


async def get_transaction(
    txid: bytes,
    load_inout: bool = True,
    load_unspent: bool = True
    # todo: network
) -> models.Transaction | None:
    q = select_transaction_statement(load_inout=load_inout, load_unspent=load_unspent).where(
        models.Transaction.id == txid
    )
    async with SessionLocal() as session:
        return (await session.scalars(q)).unique().one_or_none()


async def find_transactions(
    txids: Iterable[bytes],
    load_inout: bool = True,
    load_unspent: bool = True
    # todo: network
) -> Sequence[models.Transaction]:
    """
    Get cached transactions and pass those that don't exist
    """
    q = select_transaction_statement(load_inout=load_inout, load_unspent=load_unspent).where(
        models.Transaction.id.in_(txids)
    )
    async with SessionLocal() as session:
        return (await session.scalars(q)).unique().all()  # fixme: session.scalars() is too slow


async def add_transaction(tx: BroadcastedTransaction, apiservice: str) -> models.Transaction:
    async with SessionLocal() as session, session.begin():
        txmodel = models.Transaction.from_instance(tx, apiservice)
        session.add(txmodel)
    return txmodel


async def add_transactions(
    transactions: list[BroadcastedTransaction],
    apiservice: str,
    *,
    upsert: bool = False
) -> Iterable[models.Transaction]:
    """
    :param upsert: if false only add new transactions, if true resolve unique/pk conflict
                   with blockheight update
    """
    async with SessionLocal() as session, session.begin():
        r = [models.Transaction.from_instance(tx, apiservice) for tx in transactions]
        if upsert:
            for model in r:
                stmt = insert(models.Transaction).values([tuple(model.values(exclude=['created_at']))])
                if model.blockheight == -1:
                    stmt = stmt.on_conflict_do_nothing()
                else:
                    stmt = stmt.on_conflict_do_update(
                        index_elements=models.Transaction.__table__.primary_key,
                        set_={
                            'blockheight': model.blockheight
                        },
                    )

                await session.execute(stmt)
                for cls, io in [(models.Input, model.inputs), (models.Output, model.outputs)]:
                    await session.execute(
                        insert(cls)
                        .values([tuple(object.values()) for object in io])
                        .on_conflict_do_nothing()
                    )
        else:
            session.add_all(r)
        return r


async def get_unspent(address: str) -> Iterable[models.Unspent]:
    async with SessionLocal() as session:
        return (await session.scalars(
            select(models.Unspent)
            .where(models.Unspent.address == address)
        )).all()


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
        if unspent:
            await session.execute(
                insert(models.Unspent)
                .values([(u.txid, u.vout, u.amount, u.address.string) for u in unspent])
                .on_conflict_do_nothing()
            )
    # second way
    # async with SessionLocal() as session, session.begin():
    #     await session.execute(delete(models.Unspent).where(models.Unspent.address == addresstr))
    #     session.add_all(models.Unspent.from_instance(u) for u in unspent)


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
