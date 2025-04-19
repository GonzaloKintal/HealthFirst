from rest_framework import generics
from .models import Metric, ChartData
from .serializers import MetricSerializer, ChartDataSerializer

class MetricList(generics.ListCreateAPIView):
    queryset = Metric.objects.all()
    serializer_class = MetricSerializer

class ChartDataList(generics.ListCreateAPIView):
    queryset = ChartData.objects.all()
    serializer_class = ChartDataSerializer