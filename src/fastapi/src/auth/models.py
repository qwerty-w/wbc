import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import BaseModel
from ..models import User, CreatedMixin


class UserSession(BaseModel, CreatedMixin):
    __tablename__ = 'user_authsession'

    token: Mapped[str] = mapped_column(primary_key=True)
    userid: Mapped[int] = mapped_column(ForeignKey(User.id))
    expire: Mapped[datetime.datetime]
    revoked: Mapped[bool] = mapped_column(default=False)
    ip: Mapped[str | None]
    user_agent: Mapped[str | None]

    user: Mapped[User] = relationship()
