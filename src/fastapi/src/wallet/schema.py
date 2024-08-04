from pydantic import BaseModel, ConfigDict, Field
from btclib import NetworkType, AddressType

from .models import UserBitcoinAddress


class BaseAddress(BaseModel):
    type: AddressType
    network: NetworkType = NetworkType.MAIN
    shortname: str = Field(max_length=UserBitcoinAddress.shortname.type.length)
    emojid: str


class CreateAddressIn(BaseAddress):
    userpassword: str


class AddressOut(BaseAddress):
    string: str

    model_config = ConfigDict(from_attributes=True)
