import django.db.models
from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.serializers import ModelSerializer

from .models import Address, CachedTransaction


def index(request):
    return render(request, 'creator/index.html')


class AddressSerializer(ModelSerializer):
    class Meta:
        model = Address
        fields = ['string', 'name', 'type']


class AddressViewSet(ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

    @action(methods=['get'], detail=True)
    def get_transactions(self, request: Request, pk: str):
        transaction = CachedTransaction.objects.filter(output_address=pk)

        if not transaction:
            return Response([])

        return Response(CachedTransactionSerializer(transaction.get()).data)


class CachedTransactionSerializer(ModelSerializer):
    class Meta:
        model = CachedTransaction
        fields = [
            'txid',
            'inputs',
            'output_address',
            'other_outputs',
            'inputs_amount',
            'outputs_amount',
            'full_amount',
            'fee',
            'inputs_count',
            'outputs_count',
            'confirmations',
            'size',
            'weight',
        ]
