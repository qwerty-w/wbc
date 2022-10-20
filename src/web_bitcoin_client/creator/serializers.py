from rest_framework import serializers
from .models import Address, CachedTransaction


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['string', 'name', 'type']


class CachedTransactionSerializer(serializers.ModelSerializer):
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
