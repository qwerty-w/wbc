from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from btclib import PrivateKey

from ..models import User
from ..auth import currentuser
from ..auth.exceptions import InvalidPasswordError
from . import schema, crud


router = APIRouter(prefix='/wallet')


@router.get('/address/list', response_model=list[schema.AddressOut])
async def addresses(user: Annotated[User, Depends(currentuser)]):
    return await crud.get_addresses(user.id)


@router.post('/address/create', response_model=schema.AddressOut, description='Generate private key, get address and save it')
async def create_address(user: Annotated[User, Depends(currentuser)], a: schema.CreateAddressIn):
    try:
        return await crud.create_address(user, a.userpassword,a.type, a.network, a.shortname, a.emojid, a.pubkey_compressed)
    except ValueError:
        raise InvalidPasswordError


@router.post('/address/import')
async def import_address():
    pass


@router.post('/address/obtain', response_model=schema.ObtainedAddressOut, description='Get address from private key WIF')
async def obtain_address(a: schema.ObtainedAddressIn):
    try:
        p = PrivateKey.from_wif(a.pvwif)
    except (ValueError, AssertionError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, 'invalid wif')

    pb = p.public.change_compression(a.pubkey_compressed).change_network(a.network)
    address = pb.get_address(a.type)
    return {
        'string': address.string,
        'type': address.type,
        'network': address.network,
        'pubkey_compressed': pb.compressed
    }
