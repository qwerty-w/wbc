from typing import Annotated

from fastapi import Depends, Form, APIRouter, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.exceptions import RequestValidationError

from ..models import User
from . import crud, currentuser, schema, models, cryptoutils as cu


router = APIRouter(prefix='/auth')
oauth2 = OAuth2PasswordBearer(tokenUrl='/signin')


async def add_usersession(user: User, request: Request):
    return await crud.add_usersession(user.id, getattr(request.client, 'host', None), request.headers.get('User-Agent'))


@router.post('/signup', response_model=schema.UserSession)
async def signup(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()],
    request: Request
):
    try:
        m = schema.Signup(username=username, password=password)
    except schema.ValidationError as e:
        raise RequestValidationError(e.errors())

    if await crud.get_user_by_username(m.username):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='username already exists')

    u = await crud.add_user(m.username, m.password)
    session = await add_usersession(u, request)
    return schema.UserSession(username=u.username, access_token=session.token, expire=session.expire)


@router.post('/signin', response_model=schema.UserSession)
async def signin(formdata: Annotated[OAuth2PasswordRequestForm, Depends()], request: Request):
    u = await crud.get_user_by_username(formdata.username)
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user not found')
    if not cu.context.verify(formdata.password, u.pwd):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='wrong password')
    session = await add_usersession(u, request)
    return schema.UserSession(username=u.username, access_token=session.token, expire=session.expire)


@router.post('/change-password')
async def change_password(session: Annotated[models.UserSession, Depends(currentuser)]):
    pass  # todo:
