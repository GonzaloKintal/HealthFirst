from xmlrpc.client import NOT_WELLFORMED_ERROR
from django.views.decorators.http import require_POST
from django.views.decorators.http import require_http_methods
from .models import HealthFirstUser
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .serializers import HealthFirstUserSerializer
from django.db import IntegrityError
from django.core.paginator import Paginator



@csrf_exempt
@require_POST
def register_user(request):
    error_messages = [] 

    try:
        data = json.loads(request.body)

        user = HealthFirstUser(
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            date_of_birth=data.get('date_of_birth'),
            email=data.get('email'),   
            phone=data.get('phone'),
            user_type=data.get('user_user_type'),
            dni=data.get('dni')
        )
        
        user.set_password(data.get('password'))
        
        user.save()

    except IntegrityError:
        error_messages.append("El email o el DNI ya están registrados.")

    except KeyError as e:
        error_messages.append(f"Falta el campo: {str(e)}")

    except Exception as e:
        error_messages.append(f"Error inesperado: {str(e)}")

    if error_messages:
        return JsonResponse({'errors': error_messages}, status=500)

    return JsonResponse({'ok': True}, status=201)

@csrf_exempt
@require_POST
def users_list(request):
    data = json.loads(request.body)
    user_type = data.get('user_type', None)
    page_number = data.get('page', 1)
    page_size = data.get('page_size', 4) 

    if user_type and user_type not in HealthFirstUser.user_types():
        return JsonResponse({'error': 'El tipo de usuario no es válido.'}, status=400)

    try:
        users = HealthFirstUser.get_users(user_type)

        paginator = Paginator(users, page_size) 

        try:
            page = paginator.page(page_number)
        except Exception:
            return JsonResponse({'error': 'Número de página inválido.'}, status=400)

        serializer = HealthFirstUserSerializer(page.object_list, many=True)

        return JsonResponse({
            'users': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': page.number,
            'total_users': paginator.count,
        }, status=200)

    except Exception as e:
        return JsonResponse({'error': "Ocurrió un error inesperado"}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_user(request,dni):

    if not dni:
        return JsonResponse({'error': 'El DNI es requerido.'}, status=400)

    try:
        user = HealthFirstUser.objects.get(dni=dni,is_deleted=False)
        user.delete()

    except HealthFirstUser.DoesNotExist:
        return JsonResponse({'error': 'El usuario no existe.'}, status=404)

    return JsonResponse({'ok': True}, status=200)


@csrf_exempt
@require_http_methods(["PUT"])
def update_user(request, dni):
    data= json.loads(request.body)
    if not dni:
        return JsonResponse({'error': 'El DNI es requerido.'}, status=400)

    try:
        first_name = data.get('first_name', None)
        last_name = data.get('last_name', None)
        email = data.get('email', None)
        user_type = data.get('user_type', None)

        user = HealthFirstUser.objects.get(dni=dni,is_deleted=False)

        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        if email:
            user.email = email
        if user_type:
            user.user_type = user_type

        user.save()

        return JsonResponse({'ok': True}, status=200)    

    except HealthFirstUser.DoesNotExist:
        return JsonResponse({'error': 'El usuario no existe.'}, status=404)

    except Exception as e:
        return JsonResponse({'error': 'Ocurrio un error inesperado'}, status=500)
