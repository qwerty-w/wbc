from django.db import models


class Address(models.Model):
    string: str = models.CharField(max_length=80, primary_key=True)
    name: str = models.CharField(max_length=80)
    type: str = models.CharField(max_length=30)
    public: str = models.CharField(max_length=128)
    private: str = models.CharField(max_length=64)

    def __str__(self):
        return f'{self.string} ({self.name}) [{self.type}]'


class CachedAddress(models.Model):
    string: str = models.CharField(max_length=80, primary_key=True)
    type: str = models.CharField(max_length=30)

    def __str__(self):
        return f'{self.string} [{self.type}]'


class CachedTransaction(models.Model):
    txid: str = models.CharField(max_length=64, primary_key=True)
    inputs: models.QuerySet = models.ManyToManyField(
        CachedAddress,
        through='CachedInput',
        through_fields=('transaction', 'address'),
        related_name='as_input_transaction_set'
    )
    outputs: models.QuerySet = models.ManyToManyField(
        CachedAddress,
        through='CachedOutput',
        through_fields=('transaction', 'address'),
        related_name='as_output_transaction_set',
    )
    inputs_amount: int = models.IntegerField()
    outputs_amount: int = models.IntegerField()
    fee: int = models.IntegerField()
    inputs_count: int = models.IntegerField()
    outputs_count: int = models.IntegerField()
    confirmations: int = models.IntegerField()
    size: int = models.IntegerField()
    weight: int = models.IntegerField()
    raw: str = models.TextField()

    def __str__(self):
        return f'{self.txid} [{self.inputs_count}/{self.outputs_count}] ({self.confirmations})'


class CachedInput(models.Model):
    transaction: CachedTransaction = models.ForeignKey(CachedTransaction, on_delete=models.CASCADE)
    address: CachedAddress = models.ForeignKey(CachedAddress, on_delete=models.PROTECT)
    amount: int = models.IntegerField()

    def __str__(self):
        return f'{self.address.string} [{self.address.type}]'


class CachedOutput(models.Model):
    transaction: CachedTransaction = models.ForeignKey(CachedTransaction, on_delete=models.CASCADE)
    address: CachedAddress = models.ForeignKey(CachedAddress, on_delete=models.PROTECT)
    out_index: int = models.IntegerField()
    amount: int = models.IntegerField()

    def __str__(self):
        return f'{self.transaction.txid}:{self.out_index} ({self.address.string})'
