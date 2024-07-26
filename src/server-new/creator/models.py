import btclib
from typing import Optional
from django.db import models
from django.core.validators import MinLengthValidator


class Address(models.Model):
    name = models.CharField(max_length=120)
    string = models.CharField(max_length=80, primary_key=True)
    type = models.CharField(max_length=30)
    icon_id = models.CharField(max_length=100)
    public = models.BinaryField(max_length=128)
    private = models.BinaryField(max_length=64)

    @classmethod
    def create(cls, name: str, type: str, icon_id: str, wif: Optional[str] = None) -> 'Address':
        pv = btclib.PrivateKey(wif)  # type: ignore
        address = pv.pub.get_address(type)
        ins = cls(name, address.string, type, icon_id, pv.pub.bytes, pv.bytes)
        ins.save()

        if wif:
            ins.update_transactions()

        return ins

    def update_transactions(self):
        address = btclib.Address(self.string)
        unspents = address.get_unspents()

        for utxo in unspents:
            try:
                tx_model = Transaction.objects.get(id=utxo.tx_id)
            except Transaction.DoesNotExist:
                raw = btclib.NetworkAPI.get_transaction_by_id(utxo.tx_id)
                tx: btclib.Transaction = btclib.Transaction.deserialize(raw)  # type: ignore
                tx_model = Transaction.save_from_tx(tx)

            output = tx_model.outputs.get(vout=utxo.out_index)  # type: ignore fixme: if DoesNotExist ?
            Unspent(self, output).save()


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

    @classmethod
    def save_from_tx(cls, tx: btclib.Transaction) -> 'Transaction':
        if not tx.amount:
            print(tx.inputs.amount)
            print('set amounts')
            tx.set_amounts('mainnet')
            print(tx.inputs.amount)

        ins = cls(tx.get_id(), tx.inputs.amount, tx.outputs.amount, tx.fee, len(tx.inputs), len(tx.outputs), 0, 0, 0, tx.serialize(to_bytes=True))  # type: ignore
        ins.save()

        for inp in tx.inputs:  # type: ignore
            Input(ins, inp.tx_id, inp.out_index, inp.amount).save()

        for index, out in enumerate(tx.outputs):  # type: ignore
            out: btclib.Output
            Output(out.address.string, tx_model, index, out.amount).save()  # type: ignore

        return ins


class Output(models.Model):  # Unspent output
    address_string = models.CharField(max_length=80)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='outputs')
    vout = models.IntegerField()
    amount = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['transaction', 'vout'], name='unspent_unique_tx_vout')
        ]


class Unspent(models.Model):
    output = models.OneToOneField(Output, on_delete=models.CASCADE, related_name='unspent', primary_key=True)
    address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='unspents')


class Input(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='inputs')
    from_txid = models.CharField(max_length=64, validators=[MinLengthValidator(64)])
    from_vout = models.IntegerField()
    amount = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['from_txid', 'from_vout'], name='input_unique_tx_vout')
        ]
