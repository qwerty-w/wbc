import base64
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from btclib import PrivateKey, BaseAddress

from ..models import User
from ..auth import currentuser
from ..auth.exceptions import InvalidPasswordError
from . import schema, crud


router = APIRouter(prefix='/wallet')


def pvfrom(a: schema.ObtainedAddressIn) -> schema.AddressInfo:
    match a.intype:
        case schema.InputKeyType.wif:
            try:
                p = PrivateKey.from_wif(a.input)
            except (ValueError, AssertionError):
                raise HTTPException(status.HTTP_400_BAD_REQUEST, 'invalid wif')

            p.public.compressed = a.pubkey_compressed
            p.public.network = a.network

        case schema.InputKeyType.hex:
            p = PrivateKey.from_bytes(bytes.fromhex(a.input))

        case schema.InputKeyType.base64:
            p = PrivateKey.from_bytes(base64.b64decode(a.input.encode()))

    return schema.AddressInfo(p, p.public.get_address(a.type))


@router.get('/address/list', response_model=list[schema.UserAddressOut])
async def addresses(user: Annotated[User, Depends(currentuser)]):
    return await crud.get_addresses(user.id)


@router.post('/address/create', response_model=schema.UserAddressOut, description='Generate private key, get address and save it')
async def create_address(user: Annotated[User, Depends(currentuser)], a: schema.CreateAddressIn):
    try:
        return await crud.create_address(user, a.userpassword, a.type, a.network, a.shortname, a.emojid, a.pubkey_compressed)
    except ValueError:
        raise InvalidPasswordError


@router.post('/address/import')
async def import_address(user: Annotated[User, Depends(currentuser)], a: schema.ImportAddressIn):
    pass


@router.post('/address/obtain', response_model=schema.ObtainedAddressOut, description='Get address from private key WIF')
async def obtain_address(inf: Annotated[schema.AddressInfo, Depends(pvfrom)]):
    return {
        'type': inf.address.type,
        'network': inf.address.network,
        'pubkey_compressed': inf.p.public.compressed,
        'string': inf.address.string
    }
