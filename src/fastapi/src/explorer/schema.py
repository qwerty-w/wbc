from typing import Annotated
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


class TransactionDetail(Transaction):
    inputs: list[Input]
    outputs: list[Output]
