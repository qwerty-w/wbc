from typing import Any
from django.shortcuts import render
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet, ModelViewSet, ReadOnlyModelViewSet
from . import models, serializers


class AddressViewSet(ModelViewSet):
    queryset = models.Address.objects.all()
    serializer_class = serializers.AddressSerializer
