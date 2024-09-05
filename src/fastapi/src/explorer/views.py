from typing import Annotated
from fastapi import APIRouter, Query, Path, Depends
from fastapi.exceptions import RequestValidationError
from btclib import NetworkType, BaseAddress

from . import schema, service
from ..auth import currentuser
from ..schema import BitcoinAddress
from ..config import settings


router = APIRouter(
    prefix='/explorer',
    dependencies=[Depends(currentuser)] if settings.EXPLORER_FOR_LOGINED_ONLY else []
)


def validateaddr(
    addresstr: Annotated[str, Path],
    network: NetworkType | None = None
) -> BaseAddress:
    # validation
    try:
        return BitcoinAddress(string=addresstr, network=network).instance
    except schema.ValidationError as e:
        raise RequestValidationError(e.errors())


@router.get('/head')
async def get_head_block():  # todo: add cache
    pass


@router.get('/address/{addresstr}')
async def get_address(addresstr: Annotated[str, Depends(validateaddr)], cached: bool):
    pass


@router.get(
    '/address/{addresstr}/unspent',
    response_model=list[schema.TransactionUnspent] | list[schema.Unspent]
)
async def get_address_unspent(
    address: Annotated[BaseAddress, Depends(validateaddr)],
    network: NetworkType = NetworkType.MAIN,
    include_transaction: bool = True
):
    return await service.fetch_unspent(
        address,
        network,
        include_transaction  # type: ignore
    )


@router.get(
    '/transaction/{txid}',
    description="Get transaction info",
    response_model=schema.Transaction | schema.TransactionDetail
)
async def get_transaction(
    txid: Annotated[
        str,
        Path(pattern=r'\A[a-fA-F0-9]{64}\z')
    ],
    network: NetworkType = NetworkType.MAIN,
    cached: Annotated[
        bool,
        Query(
            description='Used to update block height'
                        ' (if it\'s set, cached is always used)'
        )
    ] = True,
    detail: Annotated[
        bool,
        Query(
            description='Return with inputs and outputs data'
        )
    ] = False
):
    return await service.get_or_add_transaction(
        bytes.fromhex(txid),
        network,
        cached,
        detail
    )


@router.post('/transaction')
async def create_transaction():
    pass
