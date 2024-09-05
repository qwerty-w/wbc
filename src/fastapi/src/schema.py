from typing import Annotated
from pydantic import BeforeValidator


# hex validator 
def tohex(i: bytes | bytearray | memoryview | str) -> str:
    return i.hex() if isinstance(i, bytes | bytearray | memoryview) else i
type strhex = Annotated[str, BeforeValidator(tohex)]
