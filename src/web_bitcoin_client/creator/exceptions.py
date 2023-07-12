from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError


class AddressInstanceStringDoesNotEqualRequestAddressString(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'address instance string does not equal address string from request'
    default_code = 600


class TransactionDoesNotBelongAddress(ValidationError):
    status_code = status.HTTP_400_BAD_REQUEST
    raw_detail = 'transaction [{txid}] is does not belong to address [{address}] (not found)'
    default_code = 601

    def __init__(self, txid: str, address: str):
        self.txid = txid
        self.address = address
        super().__init__(detail=self.raw_detail.format(txid=txid, address=address))


class InvalidAddress(ValidationError):
    status_code = status.HTTP_400_BAD_REQUEST
    raw_detail = 'address {address} is invalid'
    default_code = 602

    def __init__(self, address: str):
        self.address = address
        super().__init__(detail=self.raw_detail.format(address=address))


class InvalidType(ValidationError):
    status_code = status.HTTP_400_BAD_REQUEST
    raw_detail = 'type {type} does not support'
    default_code = 603

    def __init__(self, type: str):
        self.type = type
        super().__init__(detail=self.raw_detail.format(type=type))


class InvalidTransactionID(ValidationError):
    status_code = status.HTTP_400_BAD_REQUEST
    raw_detail = 'transaction id {txid} is invalid'
    default_code = 604

    def __init__(self, txid: str):
        self.txid = txid
        super().__init__(detail=self.raw_detail.format(txid=txid))


class AddressNotFound(ValidationError):
    status_code = status.HTTP_404_NOT_FOUND
    raw_detail = 'address {address} not found'
    default_code = 605

    def __init__(self, address: str):
        self.address = address
        super().__init__(detail=self.raw_detail.format(address=address))


class CachedAddressNotFound(ValidationError):
    status_code = status.HTTP_404_NOT_FOUND
    raw_detail = 'address {address} acting as transaction output not found in cache'
    default_code = 606

    def __init__(self, address: str):
        self.address = address
        super().__init__(detail=self.raw_detail.format(address=address))


class TransactionNotFound(ValidationError):
    status_code = status.HTTP_404_NOT_FOUND
    raw_detail = 'transaction {txid} not found in cache'
    default_code = 607

    def __init__(self, txid: str):
        self.txid = txid
        super().__init__(detail=self.raw_detail.format(txid=txid))


class InvalidPrivateKeyFormat(ValidationError):
    status_code = status.HTTP_400_BAD_REQUEST
    raw_detail = 'format {format} does not support'
    default_code = 608

    def __init__(self, format: str):
        self.format = format
        super().__init__(detail=self.raw_detail.format(format=format))
