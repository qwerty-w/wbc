from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from ..models import User
from ..auth import currentuser
from ..auth.exceptions import InvalidPasswordError
from . import schema, crud


router = APIRouter(prefix='/wallet')


@router.get('/address/list', response_model=list[schema.AddressOut])
async def addresses(user: Annotated[User, Depends(currentuser)]):
    return await crud.get_addresses(user.id)


@router.post('/address/create', response_model=schema.AddressOut)
async def create_address(user: Annotated[User, Depends(currentuser)], a: schema.CreateAddressIn):
    try:
        return await crud.create_address(user, a.userpassword,a.type, a.network, a.shortname, a.emojid)
    except ValueError:
        raise InvalidPasswordError


@router.post('/address/import')
def import_address():
    pass


@router.post('/address/obtain')
def obtain_address():
    pass
