import base64
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import datetime
from django.utils.timezone import get_current_timezone
from django.contrib.auth import get_user_model
from xmlrpc.client import NOT_WELLFORMED_ERROR
from django.views.decorators.http import require_POST
from django.views.decorators.http import require_http_methods
from .models import *
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .serializers import HealthFirstUserSerializer, LicenseSerializer
from django.db import IntegrityError
from django.core.paginator import Paginator
from rest_framework_simplejwt.views import TokenObtainPairView
from dashboard_api.serializers import CustomTokenObtainPairSerializer
from django.db.models import Q
from urllib.parse import unquote

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@csrf_exempt
@require_POST
def register_user(request):
    error_messages = [] 

    try:
        data = json.loads(request.body)
        role= Role.get_or_create(name=data.get('role_name'))
        department,_ = Department.objects.get_or_create(name=data.get('department'))
        
        user = HealthFirstUser(
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            role=role,
            department=department,
            date_of_birth=data.get('date_of_birth'),
            email=data.get('email'),   
            phone=data.get('phone'),
            dni=data.get('dni'),
        )
        
        user.set_password(data.get('password'))
        
        user.save()

    except IntegrityError:
        error_messages.append("El email ya esta registrado.")

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
    role_name = data.get('role', None)
    page_number = data.get('page', 1)
    page_size = data.get('page_size', 10) 

    if role_name and role_name not in HealthFirstUser.user_roles():
        return JsonResponse({'error': 'El tipo de usuario no es válido.'}, status=400)

    try:
        users = HealthFirstUser.get_users(role_name)

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
        user_role= data.get('role_name', None)
        password = data.get('password', None)
        department= data.get('department', None)
        dni= data.get('dni', None)
        phone= data.get('phone', None)

        user = HealthFirstUser.objects.get(id=id,is_deleted=False)
    
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        if email:
            user.email = email
        if user_role:
            role = Role.get_or_create(name=user_role)
            user.role = role
        if password:
            user.set_password(password)
        if department:
            department,_ = Department.objects.get_or_create(name=department)
            user.department = department
        if dni:
            user.dni = dni
        if phone:
            user.phone = phone

        user.save()

        return JsonResponse({'ok': True}, status=200)
    except ValidationError:
        return JsonResponse({'error': 'El tipo de usuario no es válido.'}, status=400)    

    except HealthFirstUser.DoesNotExist:
        return JsonResponse({'error': 'El usuario no existe.'}, status=404)

    except Exception as e:
        return JsonResponse({'error': 'Ocurrio un error inesperado'}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_user(request, id):
    if not id:
        response=JsonResponse({'error': 'El id es requerido.'}, status=400)
    else:
        try:
            user = HealthFirstUser.get_user(id)
            serializer = HealthFirstUserSerializer(user)
            response= JsonResponse({'user': serializer.data}, status=200)

        except HealthFirstUser.DoesNotExist:
            response =JsonResponse({'error': 'El usuario no existe.'}, status=404)

        except Exception as e:
            response= JsonResponse({'error': 'Ocurrio un error inesperado'}, status=500)

    return response

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from django.http import JsonResponse
from urllib.parse import unquote

@csrf_exempt
@require_http_methods(["GET"])
def get_users_by_filter(request, filter):
    decoded_filter = unquote(filter)
    keywords = decoded_filter.strip().split()  

    try:
        query = Q()
        for word in keywords:
            subquery = (
                Q(first_name__icontains=word) |
                Q(last_name__icontains=word) |
                Q(email__icontains=word) |
                Q(dni__icontains=word) |
                Q(department__name__icontains=word)
            )
            query &= subquery 

        users = HealthFirstUser.objects.filter(query).distinct()
        serializer = HealthFirstUserSerializer(users, many=True)
        return JsonResponse({'users': serializer.data}, status=200)

    except Exception as e:
        return JsonResponse({'error': 'Ocurrió un error inesperado'}, status=500)




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


@csrf_exempt
@require_http_methods(["POST"])
def create_license(request):
    try:
        data = json.loads(request.body)

        user_id = data.get('user_id')
        license_type = data.get('type')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        information = data.get('information', '')
        certificate_data = data.get('certificate', None)

        if not all([user_id, license_type, start_date, end_date]):
            return JsonResponse({'error': 'user_id, type, start_date, end_date son requeridos.'}, status=400)

        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado.'}, status=404)

        start_date_parsed = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_parsed = datetime.strptime(end_date, '%Y-%m-%d').date()

        if end_date_parsed < start_date_parsed:
            return JsonResponse({'error': 'end_date no puede ser anterior a start_date.'}, status=400)

        required_days = (end_date_parsed - start_date_parsed).days + 1

        # Crear la licencia
        license = License.objects.create(
            user=user,
            type=license_type,
            start_date=start_date_parsed,
            end_date=end_date_parsed,
            required_days=required_days,
            information=information,
            request_date=datetime.now(),
            justified=False,
        )

        # Crear certificado si viene incluido
        if certificate_data:
            file_data = certificate_data.get('file', None)
            if file_data:
                Certificate.objects.create(
                    license=license,
                    file=file_data, # guardamos el string base64
                    validation=certificate_data.get('validation', False),
                    upload_date=datetime.now(),
                    is_deleted=False,
                    deleted_at=None
                )

        # Crear estado inicial como "pending"
        default_status = Status.StatusChoices.PENDING

        Status.objects.create(
            license=license,
            name=default_status,
            evaluation_comment='Nueva solicitud.'
        )

        return JsonResponse({'message': 'Licencia solicitada exitosamente.'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@require_http_methods(["DELETE"])
def delete_license(request, id):
    if not id:
        return JsonResponse({'error': 'El ID es requerido.'}, status=400)

    try:
        license_obj = License.objects.get(license_id=id, is_deleted=False)
        license_obj.is_deleted = True
        license_obj.deleted_at = timezone.now()
        license_obj.save()
        return JsonResponse({'message': 'Licencia eliminada correctamente.'}, status=200)

    except License.DoesNotExist:
        return JsonResponse({'error': 'La licencia no existe.'}, status=404)
    


 # Aprobación de licencias
@csrf_exempt
@require_http_methods(["PUT"])
def evaluate_license(request, id):
    try:
        data = json.loads(request.body)

        license_status = data.get("license_status")
        comment = data.get("evaluation_comment", "")

        if license_status not in ["approved", "rejected", "missing_doc"]:
            return JsonResponse({'error': 'Estado inválido. Debe ser "approved" o "rejected".'}, status=400)

        # Verificar existencia de la licencia
        try:
            license = License.objects.get(license_id=id)
        except License.DoesNotExist:
            return JsonResponse({'error': 'Licencia no encontrada.'}, status=404)

        # Obtener o crear el objeto Status
        status_obj, created = Status.objects.get_or_create(license=license)

        # Solo permitir evaluación si el estado actual es 'pending'
        if not created and status_obj.name != Status.StatusChoices.PENDING:
            return JsonResponse({
                'error': f'La licencia no pudo ser evaluada. Estado actual: "{status_obj.name}".'
            }, status=400)

        # Actualizar estado, fecha y comentario
        status_obj.name = license_status
        status_obj.evaluation_date = now().date()
        status_obj.evaluation_comment = comment
        status_obj.save()

        return JsonResponse({'message': f'Licencia evaluada correctamente.'}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'El cuerpo de la solicitud debe ser JSON válido.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Detalle de licencia
@csrf_exempt
@require_http_methods(["GET"])
def get_license_detail(request, id):
    try:
        #User = get_user_model()

        try:
            license = License.objects.select_related("user", "status").get(license_id=id)
        except License.DoesNotExist:
            return JsonResponse({"error": "Licencia no encontrada."}, status=404)

        user = request.user

        # Validación de permisos. Descomentar cuando se implemente token.
        #allowed_roles = ["supervisor", "admin"]
        #if (license.user != user and user.role not in allowed_roles):
        #    return JsonResponse({"error": "No tenés permisos para acceder a esta licencia."}, status=403)

        # Datos del usuario solicitante
        user_data = {
            "first_name": license.user.first_name,
            "last_name": license.user.last_name,
            "email": license.user.email,
            "department": getattr(license.user, "department", None),
        }

        # Datos de la licencia
        license_data = {
            "type": license.type,
            "start_date": license.start_date,
            "end_date": license.end_date,
            "request_date": license.request_date,
            "closing_date": license.closing_date,
            "required_days": (license.end_date - license.start_date).days + 1,
            "justified": license.justified,
            "information": license.information,
        }

        # Estado actual de la licencia
        status_data = None
        if hasattr(license, "status"):
            status_data = {
                "name": license.status.name,
                "evaluation_date": license.status.evaluation_date,
                "evaluation_comment": license.status.evaluation_comment,
            }

        # Certificado relacionado
        certificate = Certificate.objects.filter(license=license, is_deleted=False).first()
        certificate_data = None
        if certificate:
            certificate_data = {
                "validation": certificate.validation,
                "upload_date": certificate.upload_date,
            }

        return JsonResponse({
            "license": license_data,
            "user": user_data,
            "status": status_data,
            "certificate": certificate_data
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)