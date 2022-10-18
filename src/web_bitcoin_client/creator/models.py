from django.db import models


class Address(models.Model):
    string = models.CharField(max_length=80, primary_key=True)
    name = models.CharField(max_length=80)
    type = models.CharField(max_length=30)
    public = models.CharField(max_length=80)
    private = models.CharField(max_length=80)


class CachedInput(models.Model):
    string = models.CharField(max_length=80, primary_key=True)
    type = models.CharField(max_length=30)


class CachedOutput(models.Model):
    string = models.CharField(max_length=80, primary_key=True)
    type = models.CharField(max_length=30)


class CachedTransaction(models.Model):
    txid = models.CharField(max_length=100, primary_key=True)
    inputs = models.ManyToManyField(CachedInput)
    output_address = models.OneToOneField(Address, on_delete=models.CASCADE)
    other_outputs = models.ManyToManyField(CachedOutput)
    inputs_amount = models.FloatField()
    outputs_amount = models.FloatField()
    full_amount = models.FloatField()
    fee = models.FloatField()
    inputs_count = models.IntegerField()
    outputs_count = models.IntegerField()
    confirmations = models.IntegerField()
    size = models.IntegerField()
    weight = models.IntegerField()
    raw = models.TextField()
