from rest_framework import serializers
from . import models


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Address
        exclude = ['private']


class CreateAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Address
        include = ['name', 'type']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Transaction
        exclude = ['raw']


class UnspentSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer()

    class Meta:
        model = models.Unspent
        exclude = ['address']
