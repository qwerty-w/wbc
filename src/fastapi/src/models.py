import datetime
from typing import Annotated
from sqlalchemy import types, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .database import BaseModel


type intpk = Annotated[int, mapped_column(primary_key=True)]
type userid = Annotated[int, mapped_column(ForeignKey('user.id'))]


class CreatedMixin:
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.current_timestamp())


class User(BaseModel, CreatedMixin):
    __tablename__ = 'user'

    id: Mapped[intpk]
    username: Mapped[str] = mapped_column(types.String(32))
    pwd: Mapped[str]
    aeskey_encrypted: Mapped[bytes]
