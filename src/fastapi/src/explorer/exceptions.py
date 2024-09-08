from functools import partial
from fastapi import status, HTTPException


class NotFoundError(HTTPException):
    def __init__(self, name: str = '', value: str | list[str] = ''):
        msg = 'not found'
        if name and value:
            if isinstance(value, list):
                v = '[' + ', '.join(f'"{e}"' for e in value) + ']'
            else:
                v = f'"{value}"'
            msg = f'{name} {v} ' + msg

        super().__init__(status.HTTP_404_NOT_FOUND, msg)


ExcessiveAddressError = HTTPException(status.HTTP_400_BAD_REQUEST, 'address is too excessive')
ServiceUnavailableError = HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, 'explorers not available now')
AddressNotFoundError = lambda a: NotFoundError('address', a.string)
TransactionNotFoundError = partial(NotFoundError, 'transaction')
TransactionsNotFoundError = partial(NotFoundError, 'transactions')
