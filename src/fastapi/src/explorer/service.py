import typing
import httpx
from anyio import to_thread
from btclib import NetworkType, Unspent, Service as API
from btclib.service import AddressInfo, NotFoundError, ServiceError, ExcessiveAddress, AddressOverflowError
from btclib.transaction import BroadcastedTransaction

from . import crud, schema, exceptions as exc


class Service:
    httpx_client = httpx.Client(follow_redirects=True)

    def __init__(self, network: NetworkType):
        self.api = API(network=network, client=self.httpx_client)

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

    async def get_address(self, address: str) -> AddressInfo:
        return await self.send(
            API.get_address,
            address,
            notfounderr=exc.AddressNotFoundError(address)
        )

    async def get_address_transactions(self, address: str) -> list[BroadcastedTransaction]:
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

    async def get_unspent(self, address: str) -> list[Unspent]:
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
    tx = await crud.get_transaction(id, load_inout=detail)

    if not tx or tx.blockheight == -1 and not cached:
        service = Service(network)
        broadcasted = await service.get_transaction(txid)
        if tx:
            if tx.blockheight != broadcasted.block:
                await crud.update_transaction_blockheight(id, broadcasted.block)
                tx.blockheight = broadcasted.block

        else:
            tx = await crud.add_transaction(
                broadcasted,
                apiservice=getattr(service.api.previous_explorer, '__name__', '')
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


async def get_or_add_unspent():
    pass
