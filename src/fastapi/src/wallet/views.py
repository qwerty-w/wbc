import base64
from typing import Annotated, overload, Literal
from asyncpg.exceptions import UniqueViolationError
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError

from btclib import PrivateKey, BaseAddress
from ..models import User
from ..auth import currentuser
from ..auth.exceptions import InvalidPasswordError
from . import schema, crud


router = APIRouter(prefix='/wallet')


@overload
def pvfrom(a: schema.ObtainedAddressIn, *, withaddress: Literal[True] = ...) -> tuple[PrivateKey, BaseAddress]:
    ...
@overload
def pvfrom(a: schema.ObtainedAddressIn, *, withaddress: Literal[False] = ...) -> tuple[PrivateKey, None]:
    ...
def pvfrom(a: schema.ObtainedAddressIn, *, withaddress: bool = True) -> tuple[PrivateKey, BaseAddress | None]:
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

    return p, withaddress and p.public.get_address(a.type) or None


async def newaddr(user: User, a: schema.CreateAddressIn, p: PrivateKey | None = None):
    if await crud.get_address_by_shortname(user.id, a.shortname):
        # shortname already exists
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"address with shortname '{a.shortname}' already exists")
    try:
        return await crud.create_address(
            user,
            a.userpassword,
            a.type,
            a.network,
            a.shortname,
            a.emojid,
            a.pubkey_compressed,
            p
        )
    except ValueError:
        raise InvalidPasswordError

    except AssertionError as e:
        # address already exists
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@router.get(
    '/address/list',
    response_model=list[schema.UserAddressOut]
)
async def addresses(user: Annotated[User, Depends(currentuser)]):
    return await crud.get_addresses(user.id)


@router.post(
    '/address/create',
    response_model=schema.UserAddressOut,
    description='Generate private key, get address and save it'
)
async def create_address(
    user: Annotated[User, Depends(currentuser)],
    a: schema.CreateAddressIn
):
    return await newaddr(user, a)


@router.post(
    '/address/import',
    response_model=schema.UserAddressOut
)
async def import_address(
    user: Annotated[User, Depends(currentuser)],
    a: schema.ImportAddressIn
):
    p, _ = pvfrom(a, withaddress=False)
    try:
        return await newaddr(user, a, p)
    except UniqueViolationError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, 'address already exists')


@router.post(
    '/address/obtain',
    response_model=schema.ObtainedAddressOut,
    description='Get address from private key WIF'
)
async def obtain_address(pa: Annotated[tuple[PrivateKey, BaseAddress], Depends(pvfrom)]):
    p, address = pa
    return {
        'type': address.type,
        'network': address.network,
        'pubkey_compressed': p.public.compressed,
        'string': address.string
    }
