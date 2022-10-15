from django.db import models


class Address(models.Model):
    name = models.CharField(max_length=80)
    string = models.CharField(max_length=80)
    type = models.CharField(max_length=30)
    public = models.CharField(max_length=80)
    private = models.CharField(max_length=80)


class CachedTransaction(models.Model):
    raw = models.TextField()
    txid = models.CharField(max_length=100)
    inps_count = models.IntegerField()
    outs_count = models.IntegerField()
