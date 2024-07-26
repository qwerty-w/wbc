from typing import Any
from functools import partial
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from . import models, validators
from .utils import convert_key_format


class address_fields:
    Name = partial(serializers.CharField, max_length=models.Address.name.field.max_length, validators=[validators.address_name_validator])  # type: ignore
    Type = partial(serializers.CharField, validators=[validators.type_validator])
    IconID = partial(serializers.CharField, max_length=models.Address.icon_id.field.max_length, validators=[validators.address_icon_id_validator])  # type: ignore


class AddressSerializer(serializers.Serializer):
    name = address_fields.Name()
    string = serializers.CharField(read_only=True)
    type = address_fields.Type(read_only=True)
    icon_id = address_fields.IconID()
    public = serializers.ModelField(model_field=models.Address.public.field, read_only=True)  # type: ignore

    def create(self, validated_data: Any) -> Any:
        """
            Creation is possible only in CreateAddress/ImportAddress serializers
        """
        raise NotImplementedError

    def update(self, instance: Any, validated_data: Any) -> Any:
        exists = False
    
        for attr in ('name', 'icon_id'):
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
                exists = True

        if not exists:
            raise ValidationError({ 'At least one of these fields is required': 'name, icon_id' })

        instance.save()
        return instance


class CreateAddressSerializer(serializers.Serializer):
    name = address_fields.Name(required=True)
    type = address_fields.Type(required=True)
    icon_id = address_fields.IconID(required=True)

    def create(self, validated_data: Any) -> Any:
        return models.Address.create(validated_data['name'], validated_data['type'], validated_data['icon_id'])

    def update(self, instance: Any, validated_data: Any) -> Any:
        raise NotImplementedError


class ImportAddressSerializer(CreateAddressSerializer):
    key = serializers.CharField(required=True, validators=[validators.private_key_validator])
    key_format = serializers.CharField(required=True, validators=[validators.private_key_format_validator])

    def create(self, validated_data: Any) -> Any:
        return models.Address.create(
            validated_data['name'],
            validated_data['type'],
            validated_data['icon_id'],
            convert_key_format(validated_data['key'], validated_data['key_format'], 'wif')
        )


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Transaction
        exclude = ['raw']


class UnspentSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer()

    class Meta:
        model = models.Unspent
        exclude = ['address']
