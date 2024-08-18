from sqlalchemy import select, update
from sqlalchemy.orm import joinedload
from btclib import BroadcastedTransaction

from ..database import SessionLocal
from . import models


async def get_unspent(address: str) -> list[models.Unspent] | None:
    async with SessionLocal() as session:
        return list(await session.scalars(
            select(models.Unspent)
            .where(models.Unspent.addresstr == address)
        ))


async def add_unspent(outxid: bytes, outvout: int, addresstr: str) -> models.Unspent:
    async with SessionLocal() as session, session.begin():
        u = models.Unspent(
            outxid=outxid,
            outvout=outvout,
            addresstr=addresstr
        )
        session.add(u)
        return u


async def get_transaction(txid: bytes, with_io: bool = False) -> models.BroadcastedTransaction | None:
    q = (select(models.BroadcastedTransaction)
        .where(models.BroadcastedTransaction.id == txid))
    if with_io:
        q = q.options(
            joinedload(models.BroadcastedTransaction.inputs),
            joinedload(models.BroadcastedTransaction.outputs)
        )
    async with SessionLocal() as session:
        return await session.scalar(q)


async def add_transaction(tx: BroadcastedTransaction, apiservice: str) -> models.BroadcastedTransaction:
    async with SessionLocal() as session, session.begin():
        dtx = models.BroadcastedTransaction(
            id=tx.id,
            inamount=tx.inputs.amount,
            outamount=tx.outputs.amount,
            incount=len(tx.inputs),
            outcount=len(tx.outputs),
            version=tx.version,
            locktime=tx.locktime,
            size=tx.size,
            vsize=tx.vsize,
            weight=tx.weight,
            is_segwit=tx.is_segwit(),
            is_coinbase=tx.is_coinbase(),
            fee=tx.fee,
            blockheight=tx.block,
            serialized=tx.serialize(),
            apiservice=apiservice
        )
        dtx.inputs.extend(
            models.Input(
                txid=dtx.id,
                index=index,
                outxid=inp.txid,
                outvout=inp.vout,
                amount=inp.amount,
                is_segwit=bool(inp.witness),
                is_coinbase=tx.is_coinbase(),
                script=inp.script.serialize(),
                witness=inp.witness.serialize(segwit=True)
            )
            for index, inp in enumerate(tx.inputs)
        )
        dtx.outputs.extend(
            models.Output(
                txid=dtx.id,
                vout=index,
                pkscript=out.pkscript.serialize(),
                amount=out.amount
            )
            for index, out in enumerate(tx.outputs)
        )
        session.add(dtx)

    return dtx


async def update_transaction_blockheight(txid: bytes, blockheight: int):
    async with SessionLocal() as session, session.begin():
        await session.execute(
            update(models.BroadcastedTransaction)
            .where(models.BroadcastedTransaction.id == txid)
            .values(blockheight=blockheight)
        )
