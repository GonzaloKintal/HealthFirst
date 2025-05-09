

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

    if not datos:
        return "Este tipo de licencia no se encuentra en la base de datos"
    

    

def get_total_days(empleado): # se obtienen el total de dias para las vacaciones
    print("")


#Las solicitudes que recibiremos seran del tipo
'''
solicitud = {
    "tipo_licencia" : "Enfermedad",
    "fecha_inicio": "",
    "fecha_fin": "",
    "dias_totales":""
}
'''
#los campos faltates: debes ser calculados u obtenidos aparte
#la fecha de la licencia debe ser posterior a la fecha actual

