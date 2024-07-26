from btclib import utils
from django.core.exceptions import ObjectDoesNotExist
# from . import exceptions


def address_string_validator(string: str):
    type, network = utils.get_address_type(string), utils.get_address_network(string)

    if None in (type, network) or not utils.validate_address(string, type, network):
        raise exceptions.InvalidAddress(string)

    utils.validate_address(string, utils.get_address_type(string), utils.get_address_network(string))


def txid_validator(txid: str):
    try:
        if len(txid) != 64:
            raise ValueError()

        bytes.fromhex(txid)
    except ValueError:
        raise exceptions.InvalidTransactionID(txid)


def type_validator(type: str):
    if type.upper() not in ['P2PKH', 'P2SH-P2WPKH', 'P2WPKH', 'P2WSH']:
        raise exceptions.InvalidType(type)


# def create_tx_inputs_validator(inputs: dict[str, list[str]]):
#     from .models import Address, CachedAddress, CachedTransaction, CachedOutput

#     for address_string, transactions in inputs.items():
#         try:
#             Address.objects.get(string=address_string)
#         except ObjectDoesNotExist:
#             raise exceptions.AddressNotFound(address_string)
#         try:
#             address = CachedAddress.objects.get(string=address_string)
#         except ObjectDoesNotExist:
#             raise exceptions.CachedAddressNotFound(address_string)

#         for txid in transactions:
#             try:
#                 tx = CachedTransaction.objects.get(txid=txid)
#             except ObjectDoesNotExist:
#                 raise exceptions.TransactionNotFound(txid)

#             if not CachedOutput.objects.filter(transaction=tx, address=address):
#                 raise exceptions.TransactionDoesNotBelongAddress(txid, address_string)


def private_key_validator(key: str, format: str):
    pass


def private_key_format_validator(format: str):
    if format.lower() not in ['wif', 'hex', 'base64', 'base58']:
        raise exceptions.InvalidPrivateKeyFormat(format=format)


def address_name_validator(name: str):
    return name


def address_icon_id_validator(icon_id: str):
    return icon_id
