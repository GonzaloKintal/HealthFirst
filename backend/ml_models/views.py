from django.shortcuts import render
from ml_models.models import *
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import JsonResponse
from ml_models.serializers import MLModelSerializer
import json
from django.core.paginator import Paginator
from .utils.coherence_model_ml import train_and_save_coherence_model
from .utils.evaluation_model import train_and_save_approval_model, train_and_save_rejection_reason_model


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def active_models(request):
    models = MLModel.objects.filter(is_active=True)
    serializer = MLModelSerializer(models, many=True)
    return JsonResponse({"models": serializer.data}, status=200)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def all_models(request):
    data = json.loads(request.body)
    page_number = int(data.get('page', 1))  # número de página (no offset)
    page_size = int(data.get('limit', 10))  # cantidad por página

    queryset = MLModel.objects.all().order_by('-id')  # puedes ajustar el orden
    paginator = Paginator(queryset, page_size)

    try:
        page = paginator.page(page_number)
    except:
        return JsonResponse({"error": "Página inválida"}, status=400)

    serializer = MLModelSerializer(page.object_list, many=True)

    return JsonResponse({
        "models": serializer.data,
        "total": paginator.count,
        "num_pages": paginator.num_pages,
        "current_page": page_number
    }, status=200)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def train_models(request):
    data = json.loads(request.body)
    models = data.get('models', [])  # Esperamos una lista de modelos

    valid_models = {'CLASSIFICATION', 'LICENSE_APPROVAL', 'REJECTION_REASON'}
    invalid_models = [m for m in models if m not in valid_models]

    if invalid_models:
        return JsonResponse({"error": f"Modelos inválidos: {invalid_models}"}, status=400)

    try:
        if 'CLASSIFICATION' in models:
            train_and_save_coherence_model()
        if 'LICENSE_APPROVAL' in models:
            train_and_save_approval_model()
        if 'REJECTION_REASON' in models:
            train_and_save_rejection_reason_model()

    except Exception as e:
        return JsonResponse({"error": f"Error al entrenar los modelos: {str(e)}"}, status=500)

    return JsonResponse({"message": f"Modelos entrenados correctamente: {models}"}, status=200)
