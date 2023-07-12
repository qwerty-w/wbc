from collections import OrderedDict
from rest_framework import serializers

from .models import Address, CachedTransaction
from . import validators


class AddressStringField(serializers.CharField):
    def __init__(self, max_length: int = 80, **kwargs):  # default max length - 80
        super().__init__(**kwargs, max_length=max_length)
        self.validators.append(validators.address_string_validator)


class TXIDField(serializers.CharField):
    def __init__(self, max_length: int = 64, **kwargs):  # default max length - 64
        super().__init__(**kwargs, max_length=max_length)
        self.validators.append(validators.txid_validator)


class AbsoluteDictField(serializers.DictField):  # dict field which also validate keys
    def __init__(self, **kwargs):
        self.key = kwargs.pop('key')
        super().__init__(**kwargs)

    def run_child_validation(self, data):
        if not self.key:
            return super().run_validation(data)

        result = {}
        errors = OrderedDict()

        for key, value in data.items():
            try:
                key = self.key.run_validation(key)
            except serializers.ValidationError as e:
                errors[key] = e.detail
                continue

            try:
                result[key] = self.child.run_validation(value)
            except serializers.ValidationError as e:
                errors[key] = e.detail

        if not errors:
            return result
        raise serializers.ValidationError(errors)

    def to_representation(self, value):
        return {
            self.key.to_representation(key): self.child.to_representation(val) if val is not None else None
            for key, val in value.items()
        }


class AddressSerializer(serializers.ModelSerializer):
    string = AddressStringField()

    class Meta:
        model = Address
        fields = [
            'string',
            'name',
            'type'
        ]


class PrivateKeyField(serializers.Serializer):
    key = serializers.CharField(min_length=0, max_length=64)
    format = serializers.CharField(min_length=0, max_length=10, validators=[validators.private_key_format_validator])

    def validate(self, data):
        validators.private_key_validator(data['key'], data['format'])


class ImportAddressSerializer(serializers.Serializer):
    private_key = PrivateKeyField()
    address_type = serializers.CharField(max_length=30, validators=[validators.type_validator])
    name = serializers.CharField(max_length=80, validators=[validators.address_name_validator])


class CachedTransactionSerializer(serializers.ModelSerializer):
    txid = TXIDField()

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


class CreateTransactionOutputSerializer(serializers.Serializer):
    address = AddressStringField()
    amount = serializers.IntegerField(min_value=0x00, max_value=2**64)


class CreateTransactionSerializer(serializers.Serializer):
    inputs = AbsoluteDictField(
        key=AddressStringField(),
        child=serializers.ListField(child=TXIDField(), allow_empty=False),
        validators=[validators.create_tx_inputs_validator],
        allow_empty=False
    )
    outputs = serializers.ListField(child=CreateTransactionOutputSerializer(), allow_empty=False)
    locktime = serializers.IntegerField(min_value=0x00, max_value=0xffffffff)
    version = serializers.IntegerField(min_value=0x00, max_value=0xffffffff)
    fee = serializers.IntegerField(min_value=0x00, max_value=0xffffffffffffffff)
