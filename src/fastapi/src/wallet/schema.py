import re
from enum import StrEnum
from typing import ClassVar
from pydantic import BaseModel, ConfigDict, Field, field_validator, ValidationInfo
from btclib import NetworkType, AddressType

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
        InputKeyType.hex: re.compile(r'[a-fA-F0-9]{64}'),  # or
        InputKeyType.base64: re.compile(r'[A-Za-z0-9+/]{40}[A-Za-z0-9+/]{3}=')
    }

    intype: InputKeyType
    input: str

    @field_validator('input')
    @classmethod
    def validate_in(cls, v: str, info: ValidationInfo):
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
