from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from ..models import User
from . import crud
from .models import UserSession


scheme = OAuth2PasswordBearer('/api/auth/signin')


async def currentsession(token: Annotated[str, Depends(scheme)]) -> UserSession:
    if not (session := await crud.verify_session(token)):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail='invalid token')
    return session


async def currentuser(session: Annotated[UserSession, Depends(currentsession)]) -> User:
    return session.user
