import django.db.models
from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.viewsets import ModelViewSet, ViewSet

from .models import Address, CachedTransaction
from .serializers import AddressSerializer, CachedTransactionSerializer


def index(request):
    return render(request, 'creator/index.html')


class AddressViewSet(ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

    @action(methods=['get'], detail=True)
    def get_transactions(self, request: Request, pk: str):
        transaction = CachedTransaction.objects.filter(output_address=pk)

        if not transaction:
            return Response([])

        return Response(CachedTransactionSerializer(transaction.get()).data)
