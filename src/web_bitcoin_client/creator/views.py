import base64
import base58check
from django.shortcuts import render, get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.viewsets import ModelViewSet, ViewSet

from btclib.services import Unspent
from btclib.address import PrivateKey, Address as btclib_Address
from btclib.transaction import Input, Output, Transaction

from . import exceptions
from .models import Address, CachedTransaction, CachedOutput
from .serializers import AddressSerializer, CachedTransactionSerializer, CreateTransactionSerializer,\
    ImportAddressSerializer


def index(request):
    return render(request, 'creator/index.html')


class AddressViewSet(ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    _import_formats = {
        'wif': lambda x: PrivateKey(x),
        'hex': lambda x: PrivateKey.from_bytes(x),
        'base58': lambda x: PrivateKey.from_bytes(base58check.b58decode(x)),
        'base64': lambda x: PrivateKey.from_bytes(base64.b64decode(x))
    }

    @action(methods=['post'], detail=False, url_path='import')
    def import_address(self, request: Request):
        serializer = ImportAddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        key = serializer['private_key']['key']
        format = serializer['private_key']['format'].lower()
        address_type = serializer['address_type']
        address_name = serializer['address_name']

        pv: PrivateKey = self._import_formats[format](key)
        pub = pv.pub
        address_ins = pub.get_address(address_type)

        address_db = Address(
            string=address_ins.string,
            name=address_name,
            type=address_type,
            public=pub.to_hex(),
            private=pv.to_bytes().hex()
        )
        address_db.save()
        return Response(status=status.HTTP_200_OK)

    @action(methods=['get'], detail=True)
    def get_transactions(self, request: Request, pk: str):
        transactions = CachedTransaction.objects.filter(output_address=pk)

        if not transactions:
            return Response([])

        return Response(list(CachedTransactionSerializer(tx).data for tx in transactions))


class TransactionViewSet(ViewSet):
    @action(methods=['get', 'post'], detail=False, url_path='create')
    def create_tx(self, request: Request):
        serializer = CreateTransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        request_data: dict = serializer.data
        serializer_inputs: dict[str, list[str]] = request_data['inputs']
        transaction_inputs: list[Input] = []
        for address_string, transactions in serializer_inputs.items():
            address_db: Address = Address.objects.get(string=address_string)
            pv = PrivateKey(address_db.private)
            address_ins = pv.pub.get_address(address_db.type)

            if address_db.string != address_ins.string:
                raise exceptions.AddressInstanceStringDoesNotEqualRequestAddressString()

            for txid in transactions:
                tx: CachedTransaction = CachedTransaction.objects.get(txid=txid)
                queryset = tx.outputs.filter(string=address_string)
                cached_output: CachedOutput = queryset.get()
                unspent = Unspent(txid, cached_output.out_index, cached_output.amount, address_string)
                transaction_inputs.append(Input.from_unspent(unspent, pv, address_ins))

        serializer_outputs: list[dict[str]] = request_data['outputs']
        transaction_outputs: list[Output] = []
        for output in serializer_outputs:
            transaction_outputs.append(Output(btclib_Address(output['address']), output['amount']))

        version, locktime = request_data['version'], request_data['locktime']
        try:
            transaction = Transaction(transaction_inputs, transaction_outputs, version, locktime)
        except Exception as e:
            raise exceptions.APIException(e.args)

        transaction.default_sign_inputs()
        return Response({'txid': transaction.get_id(), 'raw': transaction.serialize()})
