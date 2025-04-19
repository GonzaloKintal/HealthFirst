from django.db import models

class Metric(models.Model):
    title = models.CharField(max_length=100)
    value = models.IntegerField()
    percentage_change = models.FloatField()
    is_positive = models.BooleanField(default=True)
    icon = models.CharField(max_length=50)

    def __str__(self):
        return self.title

class ChartData(models.Model):
    label = models.CharField(max_length=50)
    value = models.IntegerField()