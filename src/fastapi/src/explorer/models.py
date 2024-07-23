from typing import Annotated
from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, UniqueConstraint, types, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..models import BaseModel
from ..wallet import models


type txidFK = Annotated[bytes, mapped_column(ForeignKey('blockchain_transaction.id'))]


class Input(BaseModel):
    __tablename__ = 'blockchain_input'

    txid: Mapped[txidFK] = mapped_column()
    index: Mapped[int] = mapped_column()
    outxid: Mapped[bytes] = mapped_column(types.LargeBinary(32))
    outvout: Mapped[int] = mapped_column()
    amount: Mapped[int]
    is_coinbase: Mapped[bool]
    script: Mapped[bytes]
    witness: Mapped[bytes]

    __table_args__ = (
        PrimaryKeyConstraint(txid, index),
        UniqueConstraint(outxid, outvout)
    )


class Output(BaseModel):
    __tablename__ = 'blockchain_output'

    txid: Mapped[txidFK] = mapped_column()
    vout: Mapped[int] = mapped_column()
    pkscript: Mapped[bytes]
    amount: Mapped[int]

    __table_args__ = (
        PrimaryKeyConstraint(txid, vout),
    )


class Unspent(BaseModel):
    __tablename__ = 'blockchain_unspent'

    outxid: Mapped[bytes] = mapped_column()
    outvout: Mapped[int] = mapped_column()
    addresstr: Mapped[str] = mapped_column(unique=True)

    __table_args__ = (
        PrimaryKeyConstraint(outxid, outvout),
        ForeignKeyConstraint([outxid, outvout], [Output.txid, Output.vout]),
    )


class BroadcastedTransaction(BaseModel):
    __tablename__ = 'blockchain_transaction'

    id: Mapped[bytes] = mapped_column(types.LargeBinary(32), primary_key=True)
    inamount: Mapped[int]
    outamount: Mapped[int]
    incount: Mapped[int]
    outcount: Mapped[int]
    version: Mapped[int]
    locktime: Mapped[int]
    size: Mapped[int]
    vsize: Mapped[int]
    weight: Mapped[int]
    is_segwit: Mapped[bool]
    is_coinbase: Mapped[bool]
    fee: Mapped[int]
    blockheight: Mapped[int]
    serialized: Mapped[bytes]
