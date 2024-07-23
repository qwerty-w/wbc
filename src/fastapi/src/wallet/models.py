import btclib
from sqlalchemy import types, ForeignKey, UniqueConstraint, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .. import models


class UserBitcoinKey(models.BaseModel, models.CreatedMixin):
    __tablename__ = 'user_bitcoin_key'

    id: Mapped[models.intpk]
    userid: Mapped[models.userid] = mapped_column()
    encrypted: Mapped[bytes]
    dsha256_digest: Mapped[bytes] = mapped_column()
    pubkey_xb: Mapped[bytes] = mapped_column(types.LargeBinary(32))
    pubkey_yb: Mapped[bytes] = mapped_column(types.LargeBinary(32))

    addresses: Mapped[list['UserBitcoinAddress']] = relationship(back_populates='key')

    __table_args__ = (
        UniqueConstraint(userid, dsha256_digest),
    )


class UserBitcoinAddress(models.BaseModel, models.CreatedMixin):
    __tablename__ = 'user_bitcoin_address'

    userid: Mapped[models.userid] = mapped_column()
    string: Mapped[str] = mapped_column()
    type: Mapped[btclib.AddressType]
    network: Mapped[btclib.NetworkType]
    is_pubkey_compressed: Mapped[bool]
    keyid: Mapped[int] = mapped_column(ForeignKey(UserBitcoinKey.id))
    shortname: Mapped[str] = mapped_column(types.String(64))
    emojid: Mapped[str]

    key: Mapped[UserBitcoinKey] = relationship(back_populates='addresses')

    __table_args__ = (
        PrimaryKeyConstraint(userid, string),
    )
