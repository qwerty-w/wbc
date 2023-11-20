from django.db import models
from django.core.validators import MinLengthValidator


class Address(models.Model):
    string = models.CharField(max_length=80, primary_key=True)
    type = models.CharField(max_length=30)
    name = models.CharField(max_length=120)
    icon_id = models.CharField(max_length=100)
    public = models.BinaryField(max_length=128)
    private = models.BinaryField(max_length=64)


class Transaction(models.Model):
    id = models.CharField(max_length=64, primary_key=True, validators=[MinLengthValidator(64)])
    inputs_amount = models.IntegerField()
    outputs_amount = models.IntegerField()
    fee = models.IntegerField()
    inputs_count = models.IntegerField()
    outputs_count = models.IntegerField()
    confirmations = models.IntegerField()
    size = models.IntegerField()
    weight = models.IntegerField()
    raw = models.BinaryField()

    def __str__(self):
        return f'{self.id} [{self.inputs_count} -> {self.outputs_count}] ({self.confirmations})'


class Unspent(models.Model):  # Unspent output
    address = models.CharField(max_length=80)
    transaction = models.ForeignKey(Transaction, null=True, on_delete=models.CASCADE, related_name='unspents')
    vout = models.IntegerField()
    amount = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['transaction', 'vout'], name='unspent_unique_tx_vout')
        ]


class Input(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='inputs')
    from_txid = models.CharField(max_length=64, validators=[MinLengthValidator(64)])
    from_vout = models.IntegerField()
    amount = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['from_txid', 'from_vout'], name='input_unique_tx_vout')
        ]
