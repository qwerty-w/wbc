from typing import Annotated
from anyio import to_thread
from fastapi import status, APIRouter, HTTPException, Query, Path, Depends
from btclib import address, service, NetworkType, BroadcastedTransaction

from . import crud, schema
from ..auth import currentuser
from ..config import settings


router = APIRouter(
    prefix='/explorer',
    dependencies=[Depends(currentuser)] if settings.EXPLORER_FOR_LOGINED_ONLY else []
)


@router.get('/head')
def get_head_block():
    pass


@router.get('/address/{addresstr}')
async def get_address(addresstr: str, cached: bool):
    pass


@router.get('/address/{addresstr}/unspent')
async def get_address_unspent(addresstr: str):
    pass


async def fetch_transaction_from_api(txid: str, network: NetworkType) -> tuple[BroadcastedTransaction, str]:
    """
    :param return: Tuple of transaction, explorer name
    """
    api = service.Service(network)
    try:
        tx = await to_thread.run_sync(api.get_transaction, txid)
    except service.NotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'transaction not found')
    except service.ServiceError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, 'explorers not available now')
    return tx, getattr(api.previous_explorer, '__name__', '')


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
    ] = False,
    network: NetworkType = NetworkType.MAIN
):
    idb = bytes.fromhex(txid)
    tx = await crud.get_transaction(idb, with_io=detail)

    if not tx or tx.blockheight == -1 and not cached:
        fetched, explorer_name = await fetch_transaction_from_api(txid, network)
        if tx:
            if tx.blockheight != fetched.block:
                await crud.update_transaction_blockheight(idb, fetched.block)
                tx.blockheight = fetched.block

        else:
            tx = await crud.add_transaction(fetched, apiservice=explorer_name)

    if not detail:
        return schema.Transaction.model_validate(tx)

    ous = []
    for o in tx.outputs:
        try:
            astring = address.from_pkscript(o.pkscript).string
        except ValueError:
            astring = None

        ous.append(schema.Output(
            pkscript=o.pkscript,  # type: ignore
            amount=o.amount,
            address=astring)
        )

    return schema.TransactionDetail(
        id=tx.id,  # type: ignore
        inamount=tx.inamount,
        outamount=tx.outamount,
        incount=tx.incount,
        outcount=tx.outcount,
        version=tx.version,
        locktime=tx.locktime,
        size=tx.size,
        vsize=tx.vsize,
        weight=tx.weight,
        is_segwit=tx.is_segwit,
        is_coinbase=tx.is_coinbase,
        fee=tx.fee,
        blockheight=tx.blockheight,
        inputs=[
            schema.Input(
                txid=i.outxid,  # type: ignore
                vout=i.outvout,
                amount=i.amount,
                is_segwit=i.is_segwit,
                is_coinbase=i.is_coinbase,
                script=i.script,  # type: ignore
                witness=i.witness  # type: ignore
            )
            for i in tx.inputs
        ],
        outputs=ous
    )


@router.post('/transaction')
async def create_transaction():
    pass
