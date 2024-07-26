from rest_framework import status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from . import models, serializers


class AddressViewSet(ReadOnlyModelViewSet):
    queryset = models.Address.objects.all()
    serializer_class = serializers.AddressSerializer

    def _save(self, serializer: serializers.serializers.BaseSerializer):
        serializer.is_valid(raise_exception=True)
        ins = serializer.save()
        return ins

    @action(methods=['post'], detail=False, url_path='create', url_name='create')
    def create_(self, request: Request):
        return Response(serializers.AddressSerializer(self._save(serializers.CreateAddressSerializer(data=request.data))).data, status.HTTP_201_CREATED)

    @action(methods=['post'], detail=False, url_path='import', url_name='import')
    def import_(self, request: Request):
        return Response(serializers.AddressSerializer(self._save(serializers.ImportAddressSerializer(data=request.data))).data, status.HTTP_201_CREATED)

    def partial_update(self, request: Request, pk: str):
        address = self.get_object()
        serializer = serializers.AddressSerializer(address, data=request.data, partial=True)
        return Response(serializers.AddressSerializer(self._save(serializer)).data)
