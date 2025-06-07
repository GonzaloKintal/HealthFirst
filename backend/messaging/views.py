from django.shortcuts import render
from messaging.services.messenger import MessengerService
from users.models import HealthFirstUser
from django.http import JsonResponse, HttpResponse
import json
from messaging.services.brevo_email import *
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

# Create your views here.
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_telegram_suscription(request):
    try:
        status=200
        response_data={}
        data= json.loads(request.body)
        try:
            user = HealthFirstUser.objects.get(id=data['user_id'])
        except HealthFirstUser.DoesNotExist:
            raise Exception("El usuario no existe")

        telegram_id = data['telegram_id']
        if not telegram_id:
            raise Exception("El telegram_id es requerido")

        user.add_telegram_suscription(telegram_id)
        response_data={"ok": True}


    except Exception as e:
        status=500
        response_data={"error": str(e)}

    return JsonResponse(response_data, status=status)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def remove_telegram_suscription(request,id):
    try:
        status=200
        response_data={}
        data= json.loads(request.body)
        try:
            user = HealthFirstUser.objects.get(id=data['user_id'])
        except HealthFirstUser.DoesNotExist:
            raise Exception("El usuario no existe")

        if not user.is_telegram_suscriptor:
            raise Exception("El usuario no esta suscrito a telegram")
        
        user.remove_telegram_suscription()
        response_data={"ok": True}

    except Exception as e:
            status=500
            response_data={"error": str(e)}
    

    return JsonResponse(response_data, status=status)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_telegram_suscription(request, id):
    try:
        status = 200
        try:
            user = HealthFirstUser.objects.get(id=id)
        except HealthFirstUser.DoesNotExist:
            raise Exception("El usuario no existe")

        response_data = {
            "is_subscribed": user.is_telegram_suscriptor,
            "telegram_id": user.telegram_id if user.is_telegram_suscriptor else None
        }

    except Exception as e:
        status = 500
        response_data = {"error": str(e)}

    return JsonResponse(response_data, status=status)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_email_stats(request):
    try:
        stats=get_brevo_stats()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"stats": stats}, status=200)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_email_events(request):
    try:
        data= json.loads(request.body)
        limit=data.get('limit',10)
        offset=data.get('offset', 0)
        events=get_brevo_events(limit=limit, offset=offset)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"events": events}, status=200)
    
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_email_events(request):
    data= json.loads(request.body)
    id=data.get('user_id')
    limit=data.get('limit',10)
    offset=data.get('offset', 0)
    if not id:
        return JsonResponse({"error": "El id del usuario es requerido"}, status=400)
    try:
        user = HealthFirstUser.objects.get(id=id, is_deleted=False)
    except HealthFirstUser.DoesNotExist:
        return JsonResponse({"error": "El usuario no existe"}, status=404)
    
    try:
        events = get_user_activity(email=user.email, limit=limit, offset=offset)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"events": events}, status=200)
    

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def send_personalized_message(request):
    try:
        status=200
        response_data={}
        data= json.loads(request.body)
        subject= data.get('subject')
        message= data.get('message')

        if not all([data.get('user_id'), subject, message]):
             raise ValueError("Los campos email, subject y message son requeridos")

        user= HealthFirstUser.objects.get(id=data.get('user_id'))
        
        MessengerService.send_personalized_message(user, subject, message)

        response_data={"ok": True}
    except Exception as e:
        status=500
        response_data={"error": str(e)}

    return JsonResponse(response_data, status=status)

        



            