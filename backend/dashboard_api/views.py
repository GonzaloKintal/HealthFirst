from xmlrpc.client import NOT_WELLFORMED_ERROR
from django.views.decorators.http import require_POST
from django.views.decorators.http import require_http_methods
from .models import HealthFirstUser, License
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .serializers import HealthFirstUserSerializer, LicenseSerializer
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
            user_type=data.get('user_type'),
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
def delete_user(request,id):

    if not id:
        return JsonResponse({'error': 'El id es requerido.'}, status=400)

    try:
        user = HealthFirstUser.objects.get(id=id,is_deleted=False)
        user.delete()

    except HealthFirstUser.DoesNotExist:
        return JsonResponse({'error': 'El usuario no existe.'}, status=404)

    return JsonResponse({'ok': True}, status=200)


@csrf_exempt
@require_http_methods(["PUT"])
def update_user(request, id):
    data= json.loads(request.body)
    if not id:
        return JsonResponse({'error': 'El ID es requerido.'}, status=400)

    try:
        first_name = data.get('first_name', None)
        last_name = data.get('last_name', None)
        email = data.get('email', None)
        user_type = data.get('user_type', None)

        user = HealthFirstUser.objects.get(id=id,is_deleted=False)

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


# LICENSES API
@csrf_exempt
@require_http_methods(["POST"])
def licenses_list(request):
    try:
        data = json.loads(request.body)

        status_filter = data.get('status')
        employee_name = data.get('employee_name', '').strip()
        page_number = data.get('page', 1)
        page_size = data.get('page_size', 10)

        user = request.user
        queryset = License.objects.filter(is_deleted=False) # Para no traer registros elimiandos

        # Filtro por nombre de empleado
        if employee_name:
            queryset = queryset.filter(user__first_name__icontains=employee_name)

        # Filtro por estados
        if status_filter:
            status_filter = status_filter.lower()
            if status_filter == "approved":
                queryset = queryset.filter(justified=True)
            elif status_filter == "pending":
                queryset = queryset.filter(justified=False, closing_date__isnull=True)
            elif status_filter == "rejected":
                queryset = queryset.filter(justified=False, closing_date__isnull=False)

        # Filtro por rol
        if hasattr(user, 'role') and user.role:
            if user.role.name in ['analyst', 'employee']:
                queryset = queryset.filter(user=user)

        queryset = queryset.order_by('-start_date')

        paginator = Paginator(queryset, page_size)
        page = paginator.get_page(page_number)

        serializer = LicenseSerializer(page.object_list, many=True)

        return JsonResponse({
            'licenses': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': page.number,
            'total_licenses': paginator.count,
        }, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)    


