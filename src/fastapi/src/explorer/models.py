from typing import Annotated, Self
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint, \
                       UniqueConstraint, types, ForeignKey

import btclib
from btclib.address import from_pkscript

from ..models import BaseModel, CreatedMixin, networkenum


type txidFK = Annotated[bytes, mapped_column(ForeignKey('blockchain_transaction.id', ondelete='CASCADE'))]


class Input(BaseModel):
    __tablename__ = 'blockchain_input'

    txid: Mapped[txidFK] = mapped_column()
    index: Mapped[int] = mapped_column()
    outxid: Mapped[bytes] = mapped_column(types.LargeBinary(32))
    vout: Mapped[int] = mapped_column()
    amount: Mapped[int]
    is_segwit: Mapped[bool]
    is_coinbase: Mapped[bool]
    script: Mapped[bytes]
    witness: Mapped[bytes]

    tx: Mapped['Transaction'] = relationship(back_populates='inputs')

    __table_args__ = (
        PrimaryKeyConstraint(txid, index),
        UniqueConstraint(outxid, vout)
    )


class Output(BaseModel):
    __tablename__ = 'blockchain_output'

    txid: Mapped[txidFK] = mapped_column()
    vout: Mapped[int] = mapped_column()
    pkscript: Mapped[bytes]
    amount: Mapped[int]
    address: Mapped[str | None]

    tx: Mapped['Transaction'] = relationship(back_populates='outputs')

    __table_args__ = (
        PrimaryKeyConstraint(txid, vout),
    )


class Transaction(BaseModel, CreatedMixin):
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
    network: Mapped[networkenum]
    apiservice: Mapped[str]

    inputs: Mapped[list[Input]] = relationship(back_populates='tx')
    outputs: Mapped[list[Output]] = relationship(back_populates='tx')
    unspent: Mapped[list['Unspent']] = relationship(
        secondary='blockchain_output',
        primaryjoin='Transaction.id == Output.txid',
        secondaryjoin='and_(Output.txid == Unspent.txid, Output.vout == Unspent.vout)',
        back_populates='tx',
        viewonly=True
    )

    @classmethod
    def from_instance(cls, tx: btclib.BroadcastedTransaction, apiservice: str) -> Self:
        self = cls(
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
            network=tx.network,
            apiservice=apiservice,

            inputs=[
                Input(
                    txid=tx.id,
                    index=index,
                    outxid=inp.txid,
                    vout=inp.vout,
                    amount=inp.amount,
                    is_segwit=bool(inp.witness),
                    is_coinbase=tx.is_coinbase(),
                    script=inp.script.serialize(),
                    witness=inp.witness.serialize(segwit=True)
                )
                for index, inp in enumerate(tx.inputs)
            ]
        )
        for index, out in enumerate(tx.outputs):
            try:
                address = from_pkscript(out.pkscript).string
            except ValueError:
                address = None

            self.outputs.append(
                Output(
                    txid=self.id,
                    vout=index,
                    pkscript=out.pkscript.serialize(),
                    amount=out.amount,
                    address=address
                )
            )
        return self


class Unspent(BaseModel):
    __tablename__ = 'blockchain_unspent'
    txid: Mapped[bytes] = mapped_column()
    vout: Mapped[int] = mapped_column()
    amount: Mapped[int] = mapped_column()
    address: Mapped[str | None] = mapped_column()

    tx: Mapped[Transaction] = relationship(
        secondary='blockchain_output',
        primaryjoin='and_(Unspent.txid == Output.txid, Unspent.vout == Output.vout)',
        secondaryjoin='Output.txid == Transaction.id',
        viewonly=True
    )
    output: Mapped[Output] = relationship()

    __table_args__ = (
        PrimaryKeyConstraint(txid, vout),
        ForeignKeyConstraint([txid, vout], [Output.txid, Output.vout], ondelete='CASCADE')
    )

    @classmethod
    def from_instance(cls, unspent: btclib.Unspent) -> Self:
        return cls(
            txid=unspent.txid,
            vout=unspent.vout,
            amount=unspent.amount,
            address=unspent.address.string
        )
