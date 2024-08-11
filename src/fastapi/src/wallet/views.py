import base64
from typing import Annotated
from fastapi import Request, status, APIRouter, Depends, Path, HTTPException

from btclib import PrivateKey
from ..models import User
from ..auth import currentuser
from ..auth.exceptions import InvalidPasswordError
from . import schema, crud, models


router = APIRouter(prefix='/wallet')


@router.get(
    '/address',
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
async def get_address(
    address: Annotated[models.UserBitcoinAddress, Depends(currentaddress)]
):
    return address


def pvfrom(a: schema.ObtainedAddressIn) -> PrivateKey:
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

    return p


@router.post(
    '/address:obtain',
    response_model=schema.ObtainedAddressOut,
    description='Get address from private key'
)
async def obtain_address(
    p: Annotated[PrivateKey, Depends(pvfrom)],
    a: schema.ObtainedAddressIn
):
    address = p.public.get_address(a.type)
    return {
        'type': address.type,
        'network': address.network,
        'pubkey_compressed': p.public.compressed,
        'string': address.string
    }


async def check_shortname_exists(
    user: Annotated[User, Depends(currentuser)],
    request: Request = None,  # type: ignore
    *,
    shortname: str | None = None
):
    if not shortname:
        d = await request.json()
        shortname = d.get('shortname')

        if not isinstance(shortname, str):
            raise TypeError('check_shortname_exists expects shortname as a JSON key')

    if await crud.get_address_by_shortname(user.id, shortname):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"address with shortname '{shortname}' already exists"
        )


async def newaddr(
    user: User,
    a: schema.CreateAddressIn,
    p: PrivateKey | None = None
):
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
    '/address:create',
    response_model=schema.UserAddressOut,
    dependencies=[Depends(check_shortname_exists)],
    description='Generate private key, get address and save it'
)
async def create_address(
    user: Annotated[User, Depends(currentuser)],
    a: schema.CreateAddressIn
):
    return await newaddr(user, a)


@router.post(
    '/address:import',
    dependencies=[Depends(check_shortname_exists)],
    response_model=schema.UserAddressOut
)
async def import_address(
    user: Annotated[User, Depends(currentuser)],
    p: Annotated[PrivateKey, Depends(pvfrom)],
    a: schema.ImportAddressIn
):
    return await newaddr(user, a, p)


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
    if any(v != getattr(address, n) for n, v in params):
        await check_shortname_exists(user, shortname=params.shortname)
        await crud.update_address(user.id, address.string, **params.model_dump())
        address = await currentaddress(user, address.string)
    return address


@router.delete(
    'address/{addresstr}',
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_address(
    address: Annotated[models.UserBitcoinAddress, Depends(currentaddress)]
):
    await crud.delete_address(address)
