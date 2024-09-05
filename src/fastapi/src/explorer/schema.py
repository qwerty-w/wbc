from typing import Self
from pydantic import BaseModel, Field, ConfigDict

import btclib
from ..schema import strhex
from . import models


class Base(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Input(Base):
    txid: strhex
    vout: int
    amount: int
    is_segwit: bool
    is_coinbase: bool
    script: strhex  # hex
    witness: strhex  # hex


class Output(Base):
    pkscript: strhex  # hex
    amount: int
    address: str | None


class Transaction(Base):
    id: strhex
    inamount: int
    outamount: int
    incount: int
    outcount: int
    version: int
    locktime: int
    size: int
    vsize: int
    weight: int
    is_segwit: bool
    is_coinbase: bool
    fee: int
    blockheight: int

    @classmethod
    def from_model(cls, model: models.Transaction) -> Self:
        return cls.model_validate(model)


class TransactionDetail(Transaction):
    inputs: list[Input]
    outputs: list[Output]

    @classmethod
    def from_model(cls, model: models.Transaction) -> Self:
        return cls(
            id=model.id,  # type: ignore
            inamount=model.inamount,
            outamount=model.outamount,
            incount=model.incount,
            outcount=model.outcount,
            version=model.version,
            locktime=model.locktime,
            size=model.size,
            vsize=model.vsize,
            weight=model.weight,
            is_segwit=model.is_segwit,
            is_coinbase=model.is_coinbase,
            fee=model.fee,
            blockheight=model.blockheight,
            inputs=[
                Input(
                    txid=i.outxid,  # type: ignore
                    vout=i.vout,
                    amount=i.amount,
                    is_segwit=i.is_segwit,
                    is_coinbase=i.is_coinbase,
                    script=i.script,  # type: ignore
                    witness=i.witness  # type: ignore
                )
                for i in model.inputs
            ],
            outputs=[Output.model_validate(o) for o in model.outputs]
        )


class Unspent(Base):  # todo: add blockheight
    txid: strhex
    vout: int
    amount: int
    address: str | None = Field(
        description='Address string. Not present (NotRequired) if '
                    'failed to get the address from pkscript'
    )

    @classmethod
    def _from_object(cls, object: btclib.Unspent | models.Unspent, address: str | None):
        return cls(
            txid=object.txid,  # type: ignore
            vout=object.vout,
            amount=object.amount,
            address=address
        )

    @classmethod
    def from_instance(cls, unspent: btclib.Unspent) -> Self:
        return cls._from_object(unspent, unspent.address.string)

    @classmethod
    def from_model(cls, unspent: models.Unspent) -> Self:
        return cls._from_object(unspent, unspent.address)

    def model_dump(self, *args, **kwargs):
        exclude_none: bool = kwargs.pop('exclude_none', True)
        return super().model_dump(*args, **kwargs, exclude_none=exclude_none)


class TransactionUnspent(BaseModel):
    transaction: TransactionDetail
    unspent: list[Unspent]
