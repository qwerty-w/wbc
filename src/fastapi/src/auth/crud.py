import os
import secrets
import datetime
from hashlib import sha256
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from passlib.context import CryptContext

from ..config import settings
from ..database import SessionLocal
from ..models import User
from .models import UserSession


pwdcontext = CryptContext(schemes=['argon2'], deprecated='auto')


async def get_user_by_username(username: str) -> User | None:
    async with SessionLocal() as session:
        return await session.scalar(select(User).where(User.username == username))


async def add_user(username: str, password: str) -> User:
    pwdhash = pwdcontext.hash(password)
    aeskey = os.urandom(32)

    async with SessionLocal() as session, session.begin():
        session.add(u := User(
            username=username,
            password=pwdhash,
            aeskey_encrypted=b'',  # todo: encrypt
            aeskey_sha256digest=sha256(b'').digest()
        ))
        return u


async def add_usersession(userid: int, ip: str | None, user_agent: str | None) -> UserSession:
    token = secrets.token_urlsafe(settings.USER_TOKEN_LENGTH)
    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)
    expire = now + datetime.timedelta(days=settings.USER_SESSION_EXPIRATION_DAYS)
    authsession = UserSession(
        token=token,
        userid=userid,
        expire=expire,
        ip=ip,
        user_agent=user_agent,
        created_at=now
    )
    async with SessionLocal() as session, session.begin():
        session.add(authsession)
        return authsession


async def verify_session(token: str) -> UserSession | None:
    async with SessionLocal() as s:
        session = await s.scalar(select(UserSession).where(UserSession.token == token).options(joinedload(UserSession.user)))

        if not session:
            return

        if session.revoked or datetime.datetime.now(datetime.UTC).replace(tzinfo=None) > session.expire:
            await s.delete(session)
            return

        return session
