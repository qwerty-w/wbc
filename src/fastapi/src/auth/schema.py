import datetime
from typing import Annotated
from pydantic import BaseModel, Field, ValidationError

from ..models import User


class UserSession(BaseModel):
    username: str
    access_token: str
    expire: datetime.datetime


class UsernameModel(BaseModel):
    # username pattern it's any string which:
    # - can only contain a-z, A-Z, 0-9 and _
    # - always starts with a-z or A-Z
    # - after _ always contains a-z or A-Z (digit isn't allowed)
    # - cant contains more than one _ in order
    username: Annotated[str, Field(
        min_length=4,
        max_length=User.username.type.length,
        pattern=r'\A[a-zA-Z](?:[a-zA-Z0-9]*(?:_[a-zA-Z])?)*\z'
    )]


class Signup(UsernameModel):
    password: Annotated[str, Field(min_length=8, max_length=64)]
