from pydantic import BaseModel, ConfigDict, Field
from btclib import NetworkType, AddressType

from .models import UserBitcoinAddress


class BaseAddress(BaseModel):
    type: AddressType
    network: NetworkType = NetworkType.MAIN
    pubkey_compressed: bool = True


class UserAddress(BaseAddress):
    shortname: str = Field(max_length=UserBitcoinAddress.shortname.type.length)
    emojid: str


class CreateAddressIn(UserAddress):
    userpassword: str


class AddressOut(UserAddress):
    string: str

    model_config = ConfigDict(from_attributes=True)


class ObtainedAddressIn(BaseAddress):
    pvwif: str


class ObtainedAddressOut(BaseAddress):
    string: str
