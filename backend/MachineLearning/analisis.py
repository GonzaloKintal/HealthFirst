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

def license_analysis(licencia):
    tipo = licencia["tipo_licencia"]
    datos = politicas_tipos.get(tipo)
    user_id = licencia["user_id"]

    fecha_actual = date.today()
    fecha_inicio = datetime.strptime(licencia["fecha_inicio"], "%Y-%m-%d").date() # convierto el string de la fecha atipo date
    fecha_solicitud = datetime.strptime(licencia["fecha_solicitud"], "%Y-%m-%d").date() # convierto el string de la fecha a tipo date
    
    if not datos:
        return "Este tipo de licencia no se encuentra en la base de datos"
    
    if fecha_inicio < fecha_actual:
        return "La fecha del inicio de licencia es anterior a la actual"
    
    if licencia["dias_totales"]> get_total_days_res(licencia["id"]) :
        return "Los dias solicitados exceden los dias restantes que le quedan al empleado"

    #Limite en pedidos por año
    if get_res_lim(user_id) >= datos["limite_anual_pedidos"] :
        return "Se han completado el maximo de pedidos por año"
    
    #Dias corridos
    if get_max_days_cons(user_id) >= datos["max_dias_corridos"] :
        return "Se han completado el maximo de dias corridos"
    
    #Total de dias anual
    if get_days_year(user_id) >= datos["total_dias_anual"] :
        return "Se han completado el maximo de dias por año"
    
    #Minimo de preaviso
    dias_hasta_licencia = (fecha_inicio - fecha_solicitud).days

    if dias_hasta_licencia < datos["min_preaviso"] :
        return "No cumple con el minimo de dias de preaviso para solicitar la licencia"
    

'''  
def get_total_days(): #para refactorizar las funciones, se le pasa el id del empleado y la vaiable que se quiere solicitar,siempre retorna numeros
    return 0
'''
def get_total_days_vac(user_id): # se obtienen el total de dias para las vacaciones
    anio_actual = datetime.now().year # obtengo el año actual
    fecha_ultima = datetime(anio_actual, 12, 31) #se usa para calcular la antiguedad
    try:
        usuario = HealthFirstUser.objects.get(id=user_id)

        if usuario.employment_start_date is None:
            return "El usuario no tiene una fecha de ingreso registrada"

        antiguedad_dias = fecha_ultima - usuario.employment_start_date
        antiguedad_anios = antiguedad_dias.days // 365 
        return antiguedad_anios

    except HealthFirstUser.DoesNotExist:
        return f"No existe un usuario con ID {user_id}"
    return 0

def get_total_days_res(user_id): # se obtienen el total de dias restantes que le quedan por tipo y empleado
    return 0

def get_res_lim(user_id): # se obtienen los pedidos que ya realizó, retorna 0 si no hay limite
    return 0

def get_max_days_cons(user_id): # se obtienen la cantidad de dias corridos que se tomaron
    return 0

def get_days_year(user_id): # se obtienen la cantidad de licencias de cierto tipo por año que se tomaron
    return 0






#Las solicitudes que recibiremos seran del tipo-----------------------------------------------------------------
'''
solicitud = {
    "user_id":"",
    "tipo_licencia" : "Enfermedad",
    "fecha_inicio": "",
    "fecha_fin": "",
    "dias_totales":"",
    "fecha_solicitud":""
}
'''
#los campos faltates: debes ser calculados u obtenidos aparte
#la fecha de la licencia debe ser posterior a la fecha actual

