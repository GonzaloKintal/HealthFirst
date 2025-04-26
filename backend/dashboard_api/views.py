from rest_framework import generics
from .models import Metric, ChartData
from .serializers import MetricSerializer, ChartDataSerializer
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def prueba(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        if name == "Franco":
            return JsonResponse({'message': f'{name} Usted es un crack'})
        else:
            return JsonResponse({'message': f"{name},usted no califica como crack"})
