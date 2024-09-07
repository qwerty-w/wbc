import time
from typing import Iterable, overload, Callable, Any, Literal

import httpx
from anyio import to_thread
from btclib import NetworkType, Unspent, Service as API
from btclib.address import BaseAddress
from btclib.service import DEFAULT_SERVICE_TIMEOUT, AddressInfo, NotFoundError,\
                           ExplorerError, ExcessiveAddress, AddressOverflowError, \
                           BlockchainAPI, BlockstreamAPI, ExplorerAPI
from btclib.transaction import BroadcastedTransaction

from . import crud, models, schema, exceptions as exc
from ..config import settings


class Service:
    httpx_client = httpx.Client(follow_redirects=True, timeout=DEFAULT_SERVICE_TIMEOUT)

    def __init__(self, network: NetworkType):
        self.api = API(network=network, client=self.httpx_client)

    @property
    def previous_apiservice(self) -> str:
        return getattr(self.api.previous_explorer, '__name__', '')

    async def send[T](
        self,
        f: Callable[..., T],
        *args,
        notfounderr: exc.NotFoundError | None = None,
        serviceins: ExplorerAPI | None = None,
        kwargs: dict[str, Any] = {}
    ) -> T:
        try:
            r = await to_thread.run_sync(
                f,
                serviceins if serviceins else self.api,
                *args,
                **kwargs
            )

        except (ExcessiveAddress, AddressOverflowError):
            raise exc.ExcessiveAddressError

        except NotFoundError:
            raise notfounderr or exc.NotFoundError()

        except (ExplorerError, httpx.TimeoutException, ConnectionError):
            raise exc.ServiceUnavailableError

        return r

    async def get_head_blockheight(self) -> int:
        return await self.send(API.head)

    async def get_address(self, address: BaseAddress) -> AddressInfo:
        return await self.send(
            API.get_address,
            address,
            notfounderr=exc.AddressNotFoundError(address)
        )

    async def get_address_transactions(self, address: BaseAddress) -> list[BroadcastedTransaction]:
        return await self.send(
            API.get_address_transactions,
            address,
            notfounderr=exc.AddressNotFoundError(address)
        )

    async def get_transactions(self, txids: list[str]) -> list[BroadcastedTransaction]:
        return await self.send(
            API.get_transactions,
            txids,
            notfounderr=exc.TransactionsNotFoundError(txids)
        )

    async def get_transaction(self, txid: str) -> BroadcastedTransaction:
        return await self.send(
            API.get_transaction,
            txid,
            notfounderr=exc.TransactionNotFoundError(txid)
        )

    async def get_unspent(self, address: BaseAddress) -> list[Unspent]:
        return await self.send(
            API.get_unspent,
            address,
            notfounderr=exc.AddressNotFoundError(address)
        )


def _getheadcache(foo):
    cache: dict[NetworkType, tuple[float, schema.HeadBlock]] = {}
    async def inner(network: NetworkType) -> schema.HeadBlock:
        timestamp, head = cache.get(network, (0, None))
        print(timestamp + settings.EXPLORER_HEAD_BLOCK_CACHE_TTL, time.time())
        if timestamp + settings.EXPLORER_HEAD_BLOCK_CACHE_TTL < time.time() or not head:
            print('update cache')
            head = await foo(network)
            cache[network] = (time.time(), head)
        return head
    return inner


@_getheadcache
async def gethead(network: NetworkType) -> schema.HeadBlock:
    blockheight = await Service(network).get_head_blockheight()
    return schema.HeadBlock(blockheight=blockheight)


async def getaddrinfo(address: BaseAddress) -> schema.AddressInfo:
    inf = await Service(address.network).get_address(address)
    return schema.AddressInfo.from_instance(inf)


async def get_or_add_transaction(
    txid: bytes,
    network: NetworkType,
    cached: bool,
    detail: bool
) -> schema.Transaction | schema.TransactionDetail:
    tx = await crud.get_transaction(txid, load_inout=detail, load_unspent=False)

    if not tx or tx.blockheight == -1 and not cached:
        service = Service(network)
        broadcasted = await service.get_transaction(txid.hex())
        if tx:
            if tx.blockheight != broadcasted.block:
                await crud.update_transactions_blockheight({txid: broadcasted.block})
                tx.blockheight = broadcasted.block

        else:
            tx = await crud.add_transaction(
                broadcasted,
                apiservice=service.previous_apiservice
            )

    cls = schema.TransactionDetail if detail else schema.Transaction
    return cls.from_model(tx)


async def get_address_transactions(
    address: BaseAddress,
    length: int | None,
    offset: int | None,
    last_seen_txid: str | None
) -> Iterable[schema.TransactionDetail]:
    service = Service(address.network)
    if address.network is NetworkType.MAIN:
        r = {
            'cls': BlockchainAPI,
            'func': BlockchainAPI.get_address_transactions,
            'args': [length, offset]
        }
    else:
        r = {
            'cls': BlockstreamAPI,
            'func': BlockstreamAPI.get_address_transactions,
            'args': [last_seen_txid]
        }
    transactions = await service.send(
        r['func'],
        address,
        *(a for a in r['args'] if a is not None),
        notfounderr=exc.AddressNotFoundError(address),
        serviceins=r['cls'](address.network)
    )
    await crud.add_transactions(transactions, service.previous_apiservice, upsert=True)
    return map(schema.TransactionDetail.from_instance, transactions)


@overload
async def fetch_unspent(
    address: BaseAddress,
    include_transaction: Literal[True] = True
) -> list[schema.TransactionUnspent]:
    ...
@overload
async def fetch_unspent(
    address: BaseAddress,
    include_transaction: Literal[False]
) -> list[schema.Unspent]:
    ...
async def fetch_unspent(
    address: BaseAddress,
    include_transaction: bool = True
) -> list[schema.TransactionUnspent] | list[schema.Unspent]:
    service = Service(address.network)

    # update unspent
    unspent: list[Unspent] = await service.get_unspent(address)
    await crud.put_unspent(address.string, unspent)

    if not include_transaction:
        return [schema.Unspent.from_instance(u) for u in unspent]

    # get unspent from service
    transactions: dict[bytes, models.Transaction | None] = {}
    txunspent: dict[bytes, list[Unspent]] = {}  # txid: list[unspent]
    for u in unspent:
        transactions.setdefault(u.txid, None)
        txunspent.setdefault(u.txid, [])
        txunspent[u.txid].append(u)

    # get transactions and update their blockheight's (if need)
    to_update: dict[bytes, int] = {}
    for tx in await crud.find_transactions(transactions, load_unspent=True):
        if tx.blockheight == -1:
            for u in txunspent[tx.id]:
                if u.block != -1:
                    to_update[tx.id] = tx.blockheight = u.block
                    break
        transactions[tx.id] = tx
    if to_update:
        await crud.update_transactions_blockheight(to_update)

    # get from service and add uncached transactions
    if to_add := [txid.hex() for txid, tx in transactions.items() if not tx]:
        fetched = await service.get_transactions(to_add)
        transactions.update((tx.id, tx) for tx in await crud.add_transactions(
            fetched,
            service.previous_apiservice
        ))

    return [
        schema.TransactionUnspent(
            transaction=schema.TransactionDetail.from_model(tx),
            unspent=[schema.Unspent.from_instance(u) for u in txunspent[tx.id]]
        )
        for tx in transactions.values() if tx
    ]


# todo:
# async def get_unspent(address: str, network: NetworkType) -> list[schema.Unspent]:
#     service = Service(network)
