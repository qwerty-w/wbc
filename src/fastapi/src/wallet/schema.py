from enum import StrEnum
from functools import cached_property
from typing import ClassVar, Self
from pydantic import BaseModel, ConfigDict, Field, field_validator, ValidationInfo, model_validator
import btclib

from ..schema import hexstring, base64regexp
from .models import UserBitcoinAddress


class InputKeyType(StrEnum):
    wif = 'wif'
    hex = 'hex'
    base64 = 'base64'


class BaseAddress(BaseModel):
    type: btclib.AddressType
    network: btclib.NetworkType = btclib.NetworkType.MAIN
    pubkey_compressed: bool = True


class ObtainedAddressIn(BaseAddress):
    _vin: ClassVar = {
        InputKeyType.hex: hexstring.regexp,
        InputKeyType.base64: base64regexp
    }

    intype: InputKeyType
    input: str

    @field_validator('input')
    def validateinput(cls, v: str, info: ValidationInfo):
        for type, regex in cls._vin.items():
            if info.data['intype'] == type:
                if not regex.fullmatch(v):
                    raise ValueError(f"invalid {type.value} string for regex pattern '{regex.pattern}'")
                break
        return v


class ObtainedAddressOut(BaseAddress):
    string: str


class MutableUserAddressParams(BaseModel):
    shortname: str = Field(max_length=UserBitcoinAddress.shortname.type.length)
    emojid: str


class UserAddress(BaseAddress, MutableUserAddressParams):
    ...


class UserAddressOut(UserAddress):
    string: str

    model_config = ConfigDict(from_attributes=True)


class CreateAddressIn(UserAddress):
    userpassword: str


class ImportAddressIn(CreateAddressIn, ObtainedAddressIn):
    ...


class CreateTransactionInput(BaseModel):
    txid: hexstring.length64
    vout: int
    amount: int
    address: str
    sequence: int = btclib.const.DEFAULT_SEQUENCE


class CreateTransactionOutput(BaseModel):
    amount: int


class CreateTransactionOutputAddress(CreateTransactionOutput):
    address: str

    @cached_property
    def instance(self) -> btclib.BaseAddress:
        return btclib.address.from_string(self.address)

    @model_validator(mode='after')
    def validateaddr(self) -> Self:
        self.instance  # btclib.address.from_string raises errors
        return self


class CreateTransactionOutputPkscript(CreateTransactionOutput):
    pkscript: hexstring.notempty


class CreateTransactionIn(BaseModel):
    inputs: list[CreateTransactionInput]
    outputs: list[CreateTransactionOutputAddress | CreateTransactionOutputPkscript]
    version: int = btclib.const.DEFAULT_VERSION
    locktime: int = btclib.const.DEFAULT_LOCKTIME
    userpassword: str


class CreateTransactionOut(BaseModel):
    serialized: hexstring.notempty
