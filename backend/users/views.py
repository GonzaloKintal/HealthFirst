from xmlrpc.client import NOT_WELLFORMED_ERROR

from messaging.services.messenger import MessengerService
from .models import *
from django.http import JsonResponse
import json
from .serializers import HealthFirstUserSerializer
from django.db import IntegrityError
from django.core.paginator import Paginator
from rest_framework_simplejwt.views import TokenObtainPairView
from users.serializers import CustomTokenObtainPairSerializer, DepartmentSerializer
from django.db.models import Q
from urllib.parse import unquote
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from licenses.utils.file_utils import *
from messaging.services.brevo_email import *
from .health_risk.risk_model import predict_employ_risk, predict_risk
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from rest_framework.pagination import LimitOffsetPagination


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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
            employment_start_date=data.get('employment_start_date'),
        )
        
        user.set_password(data.get('password'))
        
        user.save()

        MessengerService.send_welcome_message(user)

    except IntegrityError:
        error_messages.append("El email ya esta registrado.")

    except KeyError as e:
        error_messages.append(f"Falta el campo: {str(e)}")

    except AgeAtEmploymentError as e:
        error_messages.append(f"Error: {str(e)}")
        
    except Exception as e:
        error_messages.append(f"Error inesperado: {str(e)}")

    if error_messages:
        return JsonResponse({'errors': error_messages}, status=500)

    return JsonResponse({'ok': True}, status=201)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request,id):

    if not id:
        return JsonResponse({'error': 'El id es requerido.'}, status=400)
    if id==request.user.id:
        raise Exception("No puedes eliminar tu propio usuario.")

    try:
        user = HealthFirstUser.objects.get(id=id,is_deleted=False)
        user.delete()

    except HealthFirstUser.DoesNotExist:
        return JsonResponse({'error': 'El usuario no existe.'}, status=404)

    return JsonResponse({'ok': True}, status=200)


@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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
        date_of_birth = data.get('date_of_birth')
        phone= data.get('phone', None)
        employment_start_date = data.get('employment_start_date', None)

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
        if date_of_birth:
            user.date_of_birth = date_of_birth
        if phone:
            user.phone = phone
        if employment_start_date:
            user.employment_start_date = employment_start_date

        user.save()

        return JsonResponse({'ok': True}, status=200)

    except AgeAtEmploymentError:
        return JsonResponse({'error': 'Fecha de ingreso incorrecta. Un empleado puede ingresar a partir de los 18 anos.'}, status=400)

    except ValidationError:
        return JsonResponse({'error': 'El tipo de usuario no es válido.'}, status=400)    

    except HealthFirstUser.DoesNotExist:
        return JsonResponse({'error': 'El usuario no existe.'}, status=404)

    except Exception as e:
        return JsonResponse({'error': 'Ocurrio un error inesperado'}, status=500)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_users_by_filter(request):
    data = json.loads(request.body)
    page_number = data.get('page', 1)
    page_size = data.get('page_size', 10) 
    filter = data.get('filter', None)
    decoded_filter = unquote(filter)
    keywords = decoded_filter.strip().split()  

    try:
        query = Q(is_deleted=False)
        for word in keywords:
            subquery = (
                Q(first_name__icontains=word) |
                Q(last_name__icontains=word) |
                Q(email__icontains=word) |
                Q(dni__icontains=word) |
                Q(department__name__icontains=word) |
                Q(role__name__icontains=word)
            )
            query &= subquery 

        users = HealthFirstUser.objects.filter(query).distinct()
        paginator= Paginator(users, page_size)

        try:
            page=paginator.page(page_number)
        except Exception:
            return JsonResponse({'error': 'Número de página inválido.'}, status=400)

        serializer = HealthFirstUserSerializer(page.object_list, many=True)
        return JsonResponse({
            'users': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': page.number,
            'total_users': paginator.count
        })

    except Exception as e:
        return JsonResponse({'error': 'Ocurrió un error inesperado'}, status=500)
    

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_department(request):
    response_data = {}
    status_code = None

    try:
        data = json.loads(request.body)
        name = data.get('name', None)
        description = data.get('description', None)
        is_high_risk_department = data.get('is_high_risk_department', False)

        if not name:
            response_data = {'error': 'El nombre es requerido.'}
            status_code = 400
        elif Department.objects.filter(name=name).exists():
            response_data = {'error': 'El nombre del departamento ya existe.'}
            status_code = 400
        else:
            Department.objects.create(name=name, description=description,is_high_risk_department=is_high_risk_department)
            response_data = {'ok': True}
            status_code = 200
    except Exception as e:
        response_data = {'error': 'Ocurrió un error inesperado'}
        status_code = 500

    return JsonResponse(response_data, status=status_code)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_department(request, id):
    response_data = {}
    status_code = None

    try:
        if HealthFirstUser.objects.filter(department_id=id).exists():
            response_data = {'error': 'No se puede eliminar el departamento porque tiene usuarios asociados.'}
            status_code = 400
        else:
            department = Department.objects.get(department_id=id)
            department.delete()
            response_data = {'ok': True}
            status_code = 200

    except Department.DoesNotExist:
        response_data = {'error': 'El departamento no existe.'}
        status_code = 404

    except Exception as e:
        response_data = {'error': str(e)}
        status_code = 500

    return JsonResponse(response_data, status=status_code)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_department(request, id):
    response_data = {}
    status_code = None
    try:
        data = json.loads(request.body)
        name = data.get('name', None)
        description = data.get('description', None)
        is_high_risk_department = data.get('is_high_risk_department', None)

        if not Department.objects.filter(department_id=id).exists():
            response_data = {'error': 'El departamento no existe.'}
            status_code = 404
            return JsonResponse(response_data, status=status_code)

        department = Department.objects.get(department_id=id)

        if not name and not description and is_high_risk_department is None:
            response_data = {'error': 'Debe enviar al menos un campo.'}
            status_code = 400
        else:
            if name and name != department.name and Department.objects.exclude(department_id=id).filter(name=name).exists():
                response_data = {'error': 'El nombre del departamento ya existe.'}
                status_code = 400
            else:
                if name:
                    department.name = name
                if description:
                    department.description = description
                if is_high_risk_department is not None:
                    department.is_high_risk_department = is_high_risk_department
                
                department.save()
                response_data = {'ok': True}
                status_code = 200
            
    except Exception as e:
        response_data = {'error': 'Ocurrió un error inesperado'}
        status_code = 500

    return JsonResponse(response_data, status=status_code)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_departments(request):
    try:
        departments = Department.objects.all()
        departments_data = DepartmentSerializer(departments, many=True).data
        return JsonResponse({"departments": departments_data}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
       

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def predict_health_risk(request):
    try:
        risk_list = cache.get("cached_risk_list")

        if not risk_list:
            risk_list = json.loads(predict_risk())
            cache.set("cached_risk_list", risk_list, timeout=300) 

    except Exception as e:
        return JsonResponse({"Error inesperado al predecir riesgo": str(e)}, status=500)

    paginator = LimitOffsetPagination()
    paginated_data = paginator.paginate_queryset(risk_list, request)

    return paginator.get_paginated_response(paginated_data)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def predict_health_risk_by_id(request,id):
    try:
        risk = predict_employ_risk(id)
    except Exception as e:
        return JsonResponse({"Error inesperado al predecir riesgo": str(e)}, status=500)

    return JsonResponse({"risk": risk}, status=200)
