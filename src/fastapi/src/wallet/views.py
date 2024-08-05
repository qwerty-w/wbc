import base64
from typing import Annotated, overload, Literal
from fastapi import Body, status, APIRouter, Depends, Path, HTTPException

from btclib import PrivateKey, BaseAddress
from ..models import User
from ..auth import currentuser
from ..auth.exceptions import InvalidPasswordError
from . import schema, crud, models


router = APIRouter(prefix='/wallet')


@router.get(
    '/address/list',
    response_model=list[schema.UserAddressOut]
)
async def get_addresses(user: Annotated[User, Depends(currentuser)]):
    return await crud.get_addresses(user.id)


async def currentaddress(
    user: Annotated[User, Depends(currentuser)],
    addresstr: Annotated[str, Path(description='Address string')]
) -> models.UserBitcoinAddress:
    if not (address := await crud.get_address(userid=user.id, string=addresstr)):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, 'address not found')
    return address


@router.get(
    '/address/{addresstr}',
    response_model=schema.UserAddressOut
)
async def get_address(address: Annotated[models.UserBitcoinAddress, Depends(currentaddress)]):
    return address


@router.put(
    '/address/{addresstr}',
    response_model=schema.UserAddressOut,
    description='Update address params'
)
async def put_address(
    user: Annotated[User, Depends(currentuser)],
    address: Annotated[models.UserBitcoinAddress, Depends(currentaddress)],
    params: schema.MutableUserAddressParams
):
    if params.shortname != address.shortname or params.emojid != address.emojid:
        await crud.update_address(user.id, address.string, params.shortname, params.emojid)
        address = await currentaddress(user, address.string)
    return address


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


@router.post(
    '/address/obtain',
    response_model=schema.ObtainedAddressOut,
    description='Get address from private key'
)
async def obtain_address(pa: Annotated[tuple[PrivateKey, BaseAddress], Depends(pvfrom)]):
    p, address = pa
    return {
        'type': address.type,
        'network': address.network,
        'pubkey_compressed': p.public.compressed,
        'string': address.string
    }


async def newaddr(user: User, a: schema.CreateAddressIn, p: PrivateKey | None = None):
    if await crud.get_address_by_shortname(user.id, a.shortname):
        # todo: maybe move in separate dependency
        # shortname already exists
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"address with shortname '{a.shortname}' already exists"
        )
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
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(e))


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
    return await newaddr(user, a, p)
