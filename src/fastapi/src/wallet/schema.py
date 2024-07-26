from pydantic import BaseModel, ConfigDict
from .models import UserBitcoinAddress


class Address(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    string: str
    type: str
    network: str
    shortname: str
    emojid: str
