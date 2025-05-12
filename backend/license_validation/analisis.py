from datetime import date, datetime
import os
import django
from django.db.models import Sum

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from dashboard_api.models import License, HealthFirstUser


class LicenseValidationError(Exception): # para las excepiones
    pass


def license_analysis(licencia): #se le pasa el id de la solicitud

    if licencia.type.name== "Vacaciones" and licencia.required_days > calculate_total_vacation_days(licencia.user,licencia):
        raise LicenseValidationError ("No posee los dias suficientes para solicitar vacaciones") #actualizo la cantidad de dias que tiene por vacaciones
    
    fecha_actual = date.today()
    fecha_inicio = licencia.start_date
    fecha_solicitud = licencia.request_date
    
    if fecha_inicio < fecha_actual:
        raise LicenseValidationError ("La fecha del inicio de licencia es anterior a la actual")
    
    if licencia.type.total_days_granted is not None and licencia.required_days > get_total_days_res(licencia.user,licencia) :
        raise LicenseValidationError ("Los dias solicitados exceden los dias restantes que le quedan al empleado")

    #Limite en pedidos por año
    if licencia.type.yearly_approved_requests is not None and get_res_lim(licencia.user,licencia) >= licencia.type.yearly_approved_requests :
        raise LicenseValidationError ("Se han completado el maximo de pedidos por año")
    
    #Dias corridos
    if licencia.type.max_consecutive_days is not None and licencia.required_days > licencia.type.max_consecutive_days :
        raise LicenseValidationError ("Excede los dias corridos para este tipo de licencia")
    
    #Minimo de preaviso
 
    dias_hasta_licencia = (fecha_inicio - fecha_solicitud.date()).days
    

    if dias_hasta_licencia < licencia.type.min_advance_notice_days :
        raise LicenseValidationError ("No cumple con el minimo de dias de preaviso para solicitar la licencia")
    

def calculate_total_vacation_days(usuario, licencia): # se obtienen el total de dias para las vacaciones

    anio_actual = datetime.now().year # obtengo el año actual
    fecha_ultima = date(anio_actual, 12, 31) #se usa para calcular la antiguedad
    

    if usuario.employment_start_date is None:
         raise LicenseValidationError("El usuario no tiene una fecha de ingreso registrada")

    antiguedad_dias = fecha_ultima - usuario.employment_start_date
    antiguedad_anios = antiguedad_dias.days // 365  # obtengo la antiguedad del empleado

    days = 0
    if antiguedad_anios <= 5:
        days = 14
    elif 5 < antiguedad_anios <= 10:
        days = 21
    elif 10 < antiguedad_anios <= 20:
        days = 28
    else:
        days = 35

    return days

def get_total_days_res(user_id, licencia): # se obtienen el total de dias restantes que le quedan por tipo y empleado
    dias_utilizados = License.objects.filter(
        user=licencia.user,
        type=licencia.type,
        status__name="approved",
        is_deleted=False
    ).aggregate(total=Sum('required_days'))['total'] or 0  # si no hay registros, devuelve 0

    dias_totales = licencia.type.total_days_granted - dias_utilizados

    return dias_totales

def get_res_lim(user, licencia): # se obtienen los pedidos que ya realizó, retorna 0 si no hay limite
    user_id=user.id
    cant_pedidos_aprobados = License.objects.filter(
            user_id=user_id,
            type=licencia.type,
            status__name="approved",
            is_deleted=False
        ).count()
    
    return cant_pedidos_aprobados



