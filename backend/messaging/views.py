from django.shortcuts import render
from messaging.services.messenger import MessengerService
from users.models import HealthFirstUser
from django.http import JsonResponse, HttpResponse
import json
from messaging.services.brevo_email import *
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from messaging.services.telegram import TelegramService
from licenses.models import License


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

        
@csrf_exempt
def telegram_webhook(request):
    if request.method == 'POST':
        try:
            update = json.loads(request.body.decode('utf-8'))
            
            chat_id = update['message']['chat']['id']
            text = update['message'].get('text', '')

            user = HealthFirstUser.objects.filter(telegram_id=chat_id).last()
            if user:
                if text == '/start':
                    response_text = (
                        "¡Hola! Soy Voxi, el bot de HealthFirst desarrollado por Vox Dei Solutions.\n\n"
                        "Estoy acá para ayudarte con tus consultas de forma rápida y sencilla.\n\n"
                        "👉 Escribí /licencias y te mostraré el estado de tus últimas 10 licencias."
                    )
                elif text=='/licencias':
                    try:
                        licenses = License.objects.filter(user=user, is_deleted=False).order_by("-license_id")[:10] 

                            # Definimos los emojis para cada estado
                        status_icons = {
                                'missing_doc': '📄❓',     
                                'pending': '🔄',           
                                'rejected': '❌',          
                                'approved': '✅',          
                                'expired': '⌛'           
                            }

                        status_descriptions = {
                            'missing_doc': 'Documentación faltante',
                            'pending': 'Pendiente de aprobación',
                            'rejected': 'Rechazada',
                            'approved': 'Aprobada',
                            'expired': 'Expirada'
                        }

                        if licenses:
                            response_text = "📋 *Acá te muestro tus licencias más recientes:*\n\n"
                            for lic in licenses:
                                status_obj = getattr(lic, 'status', None)
                                if status_obj:
                                    status_name = status_obj.name
                                    status_icon = status_icons.get(status_name, '▪️')
                                    status_desc = status_descriptions.get(status_name, status_name)
                                else:
                                    status_icon = '▪️'
                                    status_desc = 'Estado no definido'
                                
                                response_text += (
                                    f"📄 Licencia #{lic.license_id}\n"
                                    f"🔄 Estado: {status_icon} {status_desc}\n\n"
                                )
                            response_text += (
                                "\n¿Necesitás más detalles sobre una licencia en particular?\n"
                                "Escribime el comando así:\n"
                                "/licencia [ID]\n"
                                "Por ejemplo: /licencia 1234\n\n"
                                "¡Estoy acá para ayudarte en lo que necesites! 💙"
                            )
                    except License.DoesNotExist:
                        response_text= "No tenes solicitudes de licencias disponibles."

                elif text.startswith('/licencia '):
                    license_id = text.split()[1]
                    try:
                        license = License.objects.get(license_id=license_id, user=user)
                        response_text = license.get_detail_for_message()
                    except License.DoesNotExist:
                        license=None
                        response_text = "Licencia no encontrada."

                elif text == '/info':
                    response_text = (
                        "📩 ¿Necesitás ayuda?\n"
                        "Podés escribirnos a: \n" 
                        "healthfirst.voxdei@gmail.com\n\n"
                        "💡 Horario de atención:\n"
                        "Lunes a viernes, de 9 a 18 hs.\n\n"
                        "🙏 Gracias por usar HealthFirst 💙"
                    )

                elif text == '/help':
                    response_text = (
                        "🆘 Ayuda - Comandos disponibles:\n\n"
                        "📋 /licencias — Muestra tus últimas 10 licencias y sus estados.\n"
                        "📄 /licencia [ID] — Muestra el detalle completo de una licencia específica.\n"
                        "ℹ️ /info — Información de contacto y horarios de atención.\n"
                        "❓ /help — Muestra este menú de ayuda.\n\n"
                        "Gracias por usar HealthFirst 💙"
                    )


                else:
                    response_text = "Comando no reconocido."

            else:
                response_text = "Usuario no autorizado para usar el sistema."
                    
            
            TelegramService.send_message(chat_id, response_text)
            
            return JsonResponse({'status': 'ok'})
        

        #se devuelve siempre 200 porque sino telegram reintenta la peticion 
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=200)
    
