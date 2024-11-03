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


def currentaddr(
    addresstr: Annotated[str, Path]
) -> BaseAddress:
    # validation
    try:
        return BitcoinAddress(string=addresstr).instance
    except schema.ValidationError as e:
        raise RequestValidationError(e.errors())


@router.get('/head', response_model=schema.HeadBlock)
async def get_head_block(network: NetworkType = NetworkType.MAIN):
    return await service.gethead(network)


@router.get('/address/{addresstr}', response_model=schema.AddressInfo)
async def get_address(address: Annotated[BaseAddress, Depends(currentaddr)]):
    # todo: add cache?
    return await service.getaddrinfo(address)


@router.get(
    '/address/{addresstr}/transactions',
    description='Get address transactions. Using blockchain.com explorer '
                'for mainnet and blockstream.info for testnet',
    response_model=list[schema.TransactionDetail]
)
async def get_address_transactions(
    address: Annotated[
        BaseAddress,
        Depends(currentaddr)
    ],
    length: int | None = None,
    offset: int | None = None,
    last_seen_txid: str | None = None
):  # todo: add cache?
    try:
        input = schema.GetAddressTransactionsInput(
            network=address.network,
            length=length,
            offset=offset,
            last_seen_txid=last_seen_txid
        )
    except schema.ValidationError as e:
        raise RequestValidationError(e.errors())
    # todo: testnet network returns 75+- transactions, not length
    return await service.get_address_transactions(
        address,
        input.length,
        input.offset,
        input.last_seen_txid
    )


@router.get(
    '/address/{addresstr}/unspent',
    response_model=list[schema.TransactionUnspent] | list[schema.Unspent]
)
async def get_address_unspent(
    address: Annotated[BaseAddress, Depends(currentaddr)],
    include_transaction: bool = True,
    cached: bool = False
):
    if cached:
        return await service.get_unspent(address, include_transaction)
    else:
        return await service.fetch_unspent(
            address,
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
        detail  # type: ignore
    )


@router.post('/transaction', response_model=schema.TransactionDetail)
async def broadcast_transaction(input: schema.BroadcastTransactionInput, network: NetworkType):
    return await service.broadcastx(input.serialized, network)
