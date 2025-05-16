from datetime import date, datetime, timedelta
import os
import django
from django.db.models import Sum

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from licenses.models import License

class LicenseValidationError(Exception): # para las excepiones
    pass


def license_analysis(license): #se le pasa el id de la solicitud

    if license.type.name== "Vacaciones" and license.required_days > calculate_total_vacation_days(license.user):
        raise LicenseValidationError ("No posee los dias suficientes para solicitar vacaciones") #actualizo la cantidad de dias que tiene por vacaciones
    
    current_date = date.today()
    start_date = license.start_date
    request_date = license.request_date
    
    if start_date < current_date:
        raise LicenseValidationError ("La fecha del inicio de licencia es anterior a la actual")
    
    if license.type.total_days_granted is not None and license.required_days > get_total_days_res(license) :
        raise LicenseValidationError ("Los dias solicitados exceden los dias restantes que le quedan al empleado")

    #Limite en pedidos por año
    if license.type.yearly_approved_requests is not None and get_res_lim(license.user,license) >= license.type.yearly_approved_requests :
        raise LicenseValidationError ("Se han completado el maximo de pedidos por año")
    
    #Dias corridos
    if license.type.max_consecutive_days is not None and license.required_days > license.type.max_consecutive_days :
        raise LicenseValidationError ("Excede los dias corridos para este tipo de licencia")
    
    #Minimo de preaviso
 
    days_until_license = (start_date - request_date.date()).days
    

    if days_until_license < license.type.min_advance_notice_days :
        raise LicenseValidationError ("No cumple con el minimo de dias de preaviso para solicitar la licencia")
    

def calculate_total_vacation_days(user): # se obtienen el total de dias para las vacaciones

    current_year = datetime.now().year # obtengo el año actual
    last_date = date(current_year, 12, 31) #se usa para calcular la antiguedad
    

    if user.employment_start_date is None:
         raise LicenseValidationError("El usuario no tiene una fecha de ingreso registrada")

    seniority_days = last_date - user.employment_start_date

    if(seniority_days.days < 180 ):
        return get_business_days(user.employment_start_date,last_date)//20
    
    seniority_years = seniority_days.days // 365  # obtengo la antiguedad del empleado

    days = 0
    if seniority_years <= 5:
        days = 14
    elif 5 < seniority_years <= 10:
        days = 21
    elif 10 < seniority_years <= 20:
        days = 28
    else:
        days = 35

    return days

def get_total_days_res(license): # se obtienen el total de dias restantes que le quedan por tipo y empleado
    used_days = License.objects.filter(
        user=license.user,
        type=license.type,
        status__name="approved",
        is_deleted=False
    ).aggregate(total=Sum('required_days'))['total'] or 0  # si no hay registros, devuelve 0

    total_days = license.type.total_days_granted - used_days

    return total_days

def get_res_lim(user, license): # se obtienen los pedidos que ya realizó, retorna 0 si no hay limite
    user_id=user.id
    approved_requests_count = License.objects.filter(
            user_id=user_id,
            type=license.type,
            status__name="approved",
            is_deleted=False
        ).count()
    
    return approved_requests_count

def get_business_days(start_date,last_date):
    business_days = 0
    current_date= start_date
    while current_date <= last_date:
         if(current_date.weekday() < 5): # si es un dia de semana(dia habil)
             business_days += 1
         current_date += timedelta(days=1)
    return business_days



