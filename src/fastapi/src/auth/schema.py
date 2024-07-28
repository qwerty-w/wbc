import datetime
from pydantic import BaseModel


class PasswordValidator:
    def validate(self): ...


class UsernameValidator:
    def validate(self): ...


class UserSession(BaseModel):
    username: str
    access_token: str
    expire: datetime.datetime
