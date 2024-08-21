from typing import Annotated
from fastapi import APIRouter, Query, Path, Depends
from btclib import NetworkType

from . import schema, service
from ..auth import currentuser
from ..config import settings


router = APIRouter(
    prefix='/explorer',
    dependencies=[Depends(currentuser)] if settings.EXPLORER_FOR_LOGINED_ONLY else []
)


@router.get('/head')
def get_head_block():  # todo: add cache
    pass


@router.get('/address/{addresstr}')
async def get_address(addresstr: str, cached: bool):
    pass


@router.get('/address/{addresstr}/unspent')
async def get_address_unspent(addresstr: str):
    pass


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
    return await service.get_or_add_transaction(txid, network, cached, detail)


@router.post('/transaction')
async def create_transaction():
    pass
