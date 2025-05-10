from datetime import date, datetime
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from dashboard_api.models import License, HealthFirstUser


#en este archivo se va a realizar el algoritmo que toma las decisiones en cuanto los motivos de liencia
politicas_tipos = {}

def define_types(): #Faltan agregar los demas tipos
    politicas_tipos= {
        "Vacaciones": {
            "min_preaviso": 2,
            "total_dias_anual": None,  #depende de antigüedad, se calcula aparte
            "max_dias_corridos": None,
            "limite_anual_pedidos": 2
        },
        "Nacimiento de hijo" : {
            "min_preaviso": 0,
            "total_dias_anual": None,
            "max_dias_corridos": 2,
            "limite_anual_pedidos": 2
        },
        "Estudios" : {
            "min_preaviso": 3,
            "total_dias_anual": 24,
            "max_dias_corridos": 4,
            "limite_anual_pedidos": None
        },
        "Maternidad" : {
            "min_preaviso": 0,
            "total_dias_anual": 90,
            "max_dias_corridos": None,
            "limite_anual_pedidos": 2
        },
        "Control prenatal" : {
            "min_preaviso": 3,
            "total_dias_anual": None,
            "max_dias_corridos": 1,
            "limite_anual_pedidos": None
        },
        "Accidente de Trabajo" : {
            "min_preaviso": 0,
            "total_dias_anual": None,
            "max_dias_corridos": None,
            "limite_anual_pedidos": None
        },
        "Enfermedad" : {
            "min_preaviso": 0,
            "total_dias_anual": None,
            "max_dias_corridos": None,
            "limite_anual_pedidos": None
        },
        "Casamiento" : {
            "min_preaviso": 7,
            "total_dias_anual": None,
            "max_dias_corridos": 12,
            "limite_anual_pedidos": 1
        },
        "Tramites prematrimoniales" : {
            "min_preaviso": 7,
            "total_dias_anual": None,
            "max_dias_corridos": 1,
            "limite_anual_pedidos": 1
        },


    }
    print("asd")

def license_analysis(id): #se le pasa el id de la solicitud
    licencia = License.objects.get(license_id=id)

    if licencia.type== "Vacaciones":
        total_days_vac(licencia.user,id) #actualizo la cantidad de dias que tiene por vacaciones
    
    fecha_actual = date.today()
    fecha_inicio = licencia.start_date
    fecha_solicitud = licencia.request_date
    
    if fecha_inicio < fecha_actual:
        return "La fecha del inicio de licencia es anterior a la actual"
    
    if licencia.required_days > get_total_days_res(licencia.user) :
        return "Los dias solicitados exceden los dias restantes que le quedan al empleado"

    #Limite en pedidos por año
    if get_res_lim(id) >= licencia.type.yearly_approved_requests :
        return "Se han completado el maximo de pedidos por año"
    
    #Dias corridos
    if get_max_days_cons(id) >= licencia.type.max_consecutive_days :
        return "Se han completado el maximo de dias corridos"
    
    #Minimo de preaviso
    dias_hasta_licencia = (fecha_inicio - fecha_solicitud).days

    if dias_hasta_licencia < licencia.type.min_advance_notice_days :
        return "No cumple con el minimo de dias de preaviso para solicitar la licencia"
    

'''  
def get_total_days(): #para refactorizar las funciones, se le pasa el id del empleado y la vaiable que se quiere solicitar,siempre retorna numeros
    return 0
'''
def total_days_vac(user_id, license_id): # se obtienen el total de dias para las vacaciones

    anio_actual = datetime.now().year # obtengo el año actual
    fecha_ultima = datetime(anio_actual, 12, 31) #se usa para calcular la antiguedad
    
    usuario = HealthFirstUser.objects.get(id=user_id)

    if usuario.employment_start_date is None:
        return "El usuario no tiene una fecha de ingreso registrada"

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

    licencia = License.objects.get(license_id=license_id)
    licencia.type.total_days_granted = days

def get_total_days_res(user_id): # se obtienen el total de dias restantes que le quedan por tipo y empleado

    return 0

def get_res_lim(user_id): # se obtienen los pedidos que ya realizó, retorna 0 si no hay limite
    return 0

def get_max_days_cons(user_id): # se obtienen la cantidad de dias corridos que se tomaron
    return 0


#la fecha de la licencia debe ser posterior a la fecha actual

