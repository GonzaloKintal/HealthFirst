from django.urls import path
from .views import MetricList, ChartDataList

urlpatterns = [
    path('metrics/', MetricList.as_view()),
    path('chart-data/', ChartDataList.as_view()),
]