from typing import Annotated
from btclib import address
from pydantic import BaseModel, BeforeValidator, ConfigDict
from pydantic.functional_validators import BeforeValidator

from . import models


def tohex(i: bytes | bytearray | memoryview | str) -> str:
    return i.hex() if isinstance(i, bytes | bytearray | memoryview) else i


type strhex = Annotated[str, BeforeValidator(tohex)]


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
    def from_model(cls, model: models.BroadcastedTransaction) -> 'Transaction':
        return cls.model_validate(model)


class TransactionDetail(Transaction):
    inputs: list[Input]
    outputs: list[Output]

    @classmethod
    def from_model(cls, model: models.BroadcastedTransaction) -> 'Transaction':
        ous = []
        for o in model.outputs:
            try:
                astring = address.from_pkscript(o.pkscript).string
            except ValueError:
                astring = None

            ous.append(Output(
                pkscript=o.pkscript,  # type: ignore
                amount=o.amount,
                address=astring)
            )
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
                    vout=i.outvout,
                    amount=i.amount,
                    is_segwit=i.is_segwit,
                    is_coinbase=i.is_coinbase,
                    script=i.script,  # type: ignore
                    witness=i.witness  # type: ignore
                )
                for i in model.inputs
            ],
            outputs=ous
        )
