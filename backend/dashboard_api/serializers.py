from rest_framework import serializers
from .models import Metric, ChartData

class MetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metric
        fields = '__all__'

class ChartDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartData
        fields = '__all__'