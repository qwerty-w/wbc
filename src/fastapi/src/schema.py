from typing import Annotated, Self
from functools import cached_property
from pydantic import BaseModel, BeforeValidator, Field, model_validator
from btclib import address, BaseAddress, NetworkType, AddressType


# hex validator
def tohex(i: bytes | bytearray | memoryview | str) -> str:
    return i.hex() if isinstance(i, bytes | bytearray | memoryview) else i
type strhex = Annotated[str, BeforeValidator(tohex)]


class BitcoinAddress(BaseModel):
    string: str
    type: AddressType | None = Field(default=None)
    network: NetworkType | None = Field(default=None)

    @cached_property
    def instance(self) -> BaseAddress:
        return address.from_string(self.string)

    @model_validator(mode='after')
    def stringv(self) -> Self:
        address.validateaddr(self.instance, self.type, self.network)
        return self
