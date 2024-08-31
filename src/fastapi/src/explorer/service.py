import typing

import httpx
from anyio import to_thread
from btclib import NetworkType, Unspent, Service as API
from btclib.address import BaseAddress, from_string as address_from_string
from btclib.service import AddressInfo, NotFoundError, ServiceError, ExcessiveAddress, AddressOverflowError
from btclib.transaction import BroadcastedTransaction

from . import crud, models, schema, exceptions as exc


class Service:
    httpx_client = httpx.Client(follow_redirects=True)

    def __init__(self, network: NetworkType):
        self.api = API(network=network, client=self.httpx_client)

    @property
    def previous_apiservice(self) -> str:
        return getattr(self.api.previous_explorer, '__name__', '')

    async def send[T](
        self,
        f: typing.Callable[..., T],
        *args,
        notfounderr: exc.NotFoundError | None = None,
        kwargs: dict[str, typing.Any] = {}
    ) -> T:
        try:
            r = await to_thread.run_sync(f, self.api, *args, **kwargs)

        except (ExcessiveAddress, AddressOverflowError):
            raise exc.ExcessiveAddressError

        except NotFoundError:
            raise notfounderr or exc.NotFoundError()

        except (ServiceError, httpx.TimeoutException, ConnectionError):
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


async def get_or_add_transaction(
    txid: str,
    network: NetworkType,
    cached: bool,
    detail: bool
) -> schema.Transaction | schema.TransactionDetail:
    id = bytes.fromhex(txid)
    tx = await crud.get_transaction(id, load_inout=detail, load_unspent=False)

    if not tx or tx.blockheight == -1 and not cached:
        service = Service(network)
        broadcasted = await service.get_transaction(txid)
        if tx:
            if tx.blockheight != broadcasted.block:
                await crud.update_transactions_blockheight({id: broadcasted.block})
                tx.blockheight = broadcasted.block

        else:
            tx = await crud.add_transaction(
                broadcasted,
                apiservice=service.previous_apiservice
            )

    cls = schema.TransactionDetail if detail else schema.Transaction
    return cls.from_model(tx)


async def get_or_add_transactions(
    txids: list[str],
    network: NetworkType,
    cached: bool,
    detail: bool
) -> list[schema.Transaction] | list[schema.TransactionDetail]:
    return [
        await get_or_add_transaction(
            txid,
            network,
            cached,
            detail
        )
        for txid in txids
    ]


async def fetch_unspent(address: str, network: NetworkType) -> list[schema.Unspent]:
    service = Service(network)

    transactions: dict[bytes, models.Transaction | None] = {}
    unspent: dict[bytes, list[Unspent]] = {}

    for u in await service.get_unspent(address_from_string(address)):
        transactions.setdefault(u.txid, None)
        unspent.setdefault(u.txid, [])
        unspent[u.txid].append(u)

    # await crud.drop_used_unspent(unspent)  # todo:
    to_update: dict[bytes, int] = {}

    for tx in await crud.find_transactions(transactions, load_unspent=True):
        if tx.blockheight == -1:
            height = -1
            for u in unspent[tx.id]:
                if u.block != -1:
                    height = u.block
                    break
            else:
                continue
            to_update[tx.id] = tx.blockheight = height
        transactions[tx.id] = tx

    if to_update:
        await crud.update_transactions_blockheight(to_update)

    if to_add := [txid.hex() for txid, tx in transactions.items() if not tx]:
        fetched = await service.get_transactions(to_add)
        transactions.update((tx.id, tx) for tx in await crud.add_transactions(
            fetched,
            service.previous_apiservice,
            with_unspent=unspent
        ))

    return [
        schema.Unspent(
            transaction=schema.TransactionDetail.from_model(tx),
            unspent=[schema.SingleUnspent.from_model(u) for u in tx.unspent]
        )
        for tx in transactions.values() if tx
    ]


# todo:
# async def get_unspent(address: str, network: NetworkType) -> list[schema.Unspent]:
#     service = Service(network)
