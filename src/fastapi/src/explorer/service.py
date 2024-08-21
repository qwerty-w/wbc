from typing import Any, Callable, Optional
from anyio import to_thread
from fastapi import status, HTTPException
from httpx import Client, TimeoutException
from btclib import service, NetworkType, Unspent
from btclib.service import AddressInfo, NotFoundError, ServiceError, ExcessiveAddress, AddressOverflowError
from btclib.transaction import BroadcastedTransaction


def notfounderror(n: str = '', v: str | list[str] = ''):
    msg = 'not found'
    if n and v:
        if isinstance(v, list):
            v = '[' + ', '.join(f'"{e}"' for e in v) + ']'
        else:
            v = f'"{v}"'
        msg = f'{n} {v} ' + msg
    return HTTPException(status.HTTP_404_NOT_FOUND, msg)


class Service:
    CLIENT = Client(follow_redirects=True)

    def __init__(self, network: NetworkType):
        self.api = service.Service(network=network, client=self.CLIENT)

    async def send[T](
        self,
        f: Callable[..., T],
        *args,
        notfounderr: Optional[HTTPException] = None,
        kwargs: dict[str, Any] = {}
    ) -> T:
        try:
            r = await to_thread.run_sync(f, self.api, *args, **kwargs)

        except (ExcessiveAddress, AddressOverflowError):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, 'address is too excessive')

        except NotFoundError:
            raise notfounderr or notfounderror()

        except (ServiceError, TimeoutException, ConnectionError):
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, 'explorers not available now')

        return r

    async def get_head_blockheight(self) -> int:
        return await self.send(service.Service.head)

    async def get_address(self, address: str) -> AddressInfo:
        return await self.send(
            service.Service.get_address,
            address,
            notfounderr=notfounderror('address', address)
        )

    async def get_address_transactions(self, address: str) -> list[BroadcastedTransaction]:
        return await self.send(
            service.Service.get_address_transactions,
            address,
            notfounderr=notfounderror('address', address)
        )

    async def get_transactions(self, txids: list[str]) -> list[BroadcastedTransaction]:
        return await self.send(
            service.Service.get_transactions,
            txids,
            notfounderr=notfounderror('transactions', txids)
        )

    async def get_transaction(self, txid: str) -> BroadcastedTransaction:
        return await self.send(
            service.Service.get_transaction,
            txid,
            notfounderr=notfounderror('transaction', txid)
        )

    async def get_unspent(self, address: str) -> list[Unspent]:
        return await self.send(
            service.Service.get_unspent,
            address,
            notfounderr=notfounderror('address', address)
        )
