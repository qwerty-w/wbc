import datetime
from typing import Annotated
from btclib import NetworkType
from sqlalchemy import types, func, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column
from .database import BaseModel


type intpk = Annotated[int, mapped_column(primary_key=True)]
type userid = Annotated[int, mapped_column(ForeignKey('user.id'))]
type networkenum = Annotated[NetworkType, mapped_column(Enum(NetworkType, values_callable=lambda n: [e.value for e in n]))]


class CreatedMixin:
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.current_timestamp())


class LastAccessedMixin:
    last_accessed_at: Mapped[datetime.datetime] = mapped_column(server_default=func.current_timestamp())


class User(BaseModel, CreatedMixin):
    __tablename__ = 'user'

    id: Mapped[intpk]
    username: Mapped[str] = mapped_column(types.String(32), unique=True)
    pwd: Mapped[str]
    kdf_options: Mapped[str]
    kdf_digest: Mapped[bytes] = mapped_column(types.LargeBinary(32))  # kdf(argon2) dsha256 digest
    ckey_encrypted: Mapped[bytes]  # aes common key encrypted (argon2-metadata$encrypted)
