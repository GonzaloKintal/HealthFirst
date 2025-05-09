from datetime import date

#en este archivo se va a realizar el algoritmo que toma las decisiones en cuanto los motivos de liencia
politicas_tipos = {}

def define_types():
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

    fecha_actual = date.today()

    if not datos:
        return "Este tipo de licencia no se encuentra en la base de datos"
    
    if licencia["fecha_inicio"]< fecha_actual:
        return "La fecha del inicio de licencia es anterior a la actual"
    
    if licencia["dias_totales"]> get_total_days_res(licencia["dni"]) :
        return "Los dias solicitados exceden los dias restantes que le quedan al empleado"

    #Limite en pedidos por año
    if get_res_lim(tipo) >= datos["limite_anual_pedidos"] :
        return "Se han completado el maximo de pedidos por año"
    
    #Dias corridos
    if get_max_days_cons(tipo) >= datos["max_dias_corridos"] :
        return "Se han completado el maximo de dias corridos"
    #Total de dias anual
    #Minimo de preaviso
    
    

def get_total_days_vac(id_empleado): # se obtienen el total de dias para las vacaciones
    return 0

def get_total_days_res(id_empleado): # se obtienen el total de dias restantes que le quedan por tipo y empleado
    return 0

def get_res_lim(id_empleado): # se obtienen los pedidos que ya realizó, retorna 0 si no hay limite
    return 0

def get_max_days_cons(id_empleado): # se obtienen la cantidad de dias corridos que se tomaron
    return 0

#Las solicitudes que recibiremos seran del tipo
'''
solicitud = {
    "dni":"",
    "tipo_licencia" : "Enfermedad",
    "fecha_inicio": "",
    "fecha_fin": "",
    "dias_totales":""
}
'''
#los campos faltates: debes ser calculados u obtenidos aparte
#la fecha de la licencia debe ser posterior a la fecha actual

