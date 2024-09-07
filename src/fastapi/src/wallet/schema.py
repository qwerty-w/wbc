from enum import StrEnum
from typing import ClassVar
from pydantic import BaseModel, ConfigDict, Field, field_validator, ValidationInfo
from btclib import NetworkType, AddressType

from ..schema import hexstring, base64regexp
from .models import UserBitcoinAddress


class InputKeyType(StrEnum):
    wif = 'wif'
    hex = 'hex'
    base64 = 'base64'


class BaseAddress(BaseModel):
    type: AddressType
    network: NetworkType = NetworkType.MAIN
    pubkey_compressed: bool = True


class ObtainedAddressIn(BaseAddress):
    _vin: ClassVar = {
        InputKeyType.hex: hexstring.regexp,
        InputKeyType.base64: base64regexp
    }

    intype: InputKeyType
    input: str

    @field_validator('input')
    @classmethod
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
