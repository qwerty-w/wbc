import re
from typing import Annotated, Self
from functools import cached_property
from pydantic import BaseModel, BeforeValidator, Field, model_validator
from btclib import address, BaseAddress, NetworkType, AddressType


base64regexp = re.compile(r'[A-Za-z0-9+/]{40}[A-Za-z0-9+/]{3}=')


class hexstring:
    @staticmethod
    def hexvalidator(i: bytes | bytearray | memoryview | str) -> str:
        return i.hex() if isinstance(i, bytes | bytearray | memoryview) else i

    @staticmethod
    def fieldargs(length: int | None = None, pattern: str | None = None):
        return [
            Field(
                pattern=pattern or hexstring.pattern,
                **dict(
                    min_length=length,
                    max_length=length
                ) if length else {}  # type: ignore
            ),
            hexstring.validator
        ]

    pattern = r'\A(?:[a-fA-F0-9]{2})*\z'  # rust (pydantic) pattern
    regexp = re.compile(pattern.replace(r'\z', r'\Z'))
    validator = BeforeValidator(hexvalidator)

    type any = Annotated[str, *fieldargs()]
    type noempty = Annotated[str, *fieldargs(pattern=pattern.replace('*', '+'))]
    type length32 = Annotated[str, *fieldargs(32)]
    type length64 = Annotated[str, *fieldargs(64)]


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
