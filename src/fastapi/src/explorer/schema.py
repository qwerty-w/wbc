from typing import Self
from functools import cached_property
from pydantic import computed_field,  BaseModel, Field, ConfigDict, ValidationError, model_validator
import btclib

from ..schema import hexstring
from . import models


class HeadBlock(BaseModel):
    blockheight: int = Field(ge=0)


class GetAddressTransactionsInput(BaseModel):
    network: btclib.NetworkType
    length: int | None
    offset: int | None
    last_seen_txid: str | None

    @model_validator(mode='after')
    def validateparams(self) -> Self:
        if all(p is not None for p in [self.length, self.offset, self.last_seen_txid]):
            raise ValueError()
        if self.network is btclib.NetworkType.MAIN and not self.length:
            raise ValueError(f"length param must be specified for '{self.network.value}' network")
        return self


class Base(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class AddressInfo(Base):
    address: str
    received: int
    spent: int
    tx_count: int
    network: btclib.NetworkType

    @classmethod
    def from_instance(cls, instance: btclib.service.AddressInfo) -> Self:
        return cls(
            address=instance.address.string,
            received=instance.received,
            spent=instance.spent,
            tx_count=instance.tx_count,
            network=instance.address.network
        )

    @computed_field
    @cached_property
    def balance(self) -> int:
        return self.received - self.spent


class Input(Base):
    txid: hexstring.length64
    vout: int
    amount: int
    is_segwit: bool
    is_coinbase: bool
    script: hexstring.any
    witness: hexstring.any


class Output(Base):
    pkscript: hexstring.any
    amount: int
    address: str | None


class Transaction(Base):
    id: hexstring.length64
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
    def from_instance(cls, instance: btclib.BroadcastedTransaction) -> Self:
        return cls(
            id=instance.id.hex(),
            inamount=instance.inputs.amount,
            outamount=instance.outputs.amount,
            incount=len(instance.inputs),
            outcount=len(instance.outputs),
            version=instance.version,
            locktime=instance.locktime,
            size=instance.size,
            vsize=instance.vsize,
            weight=instance.weight,
            is_segwit=instance.is_segwit(),
            is_coinbase=instance.is_coinbase(),
            fee=instance.fee,
            blockheight=instance.block,
            inputs=[
                Input(
                    txid=i.txid,  # type: ignore
                    vout=i.vout,
                    amount=i.amount,
                    is_segwit=bool(i.witness),
                    is_coinbase=isinstance(i, btclib.CoinbaseInput),
                    script=i.script.serialize(),  # type: ignore
                    witness=i.witness.serialize(segwit=True)  # type: ignore
                )
                for i in instance.inputs
            ],
            outputs=[
                Output(**o.as_dict())
                for o in instance.outputs
            ]
        )

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


class Unspent(Base):
    txid: hexstring.length64  # todo: maybe remove this field in TransactionUnspent
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


class BroadcastTransactionInput(BaseModel):
    serialized: hexstring.notempty
