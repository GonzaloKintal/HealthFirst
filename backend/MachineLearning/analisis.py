

#en este archivo se va a realizar el algoritmo que toma las decisiones en cuanto los motivos de liencia

def define_types():
    politicas_tipos= {
        "Vacaciones": {
            "requiere_justificativo": False,
            "min_preaviso": 2,
            "tolerancia_justificativo": None,
            "total_dias_anual": None,  #depende de antigüedad, se calcula aparte
            "max_dias_corridos": None,
            "limite_anual_pedidos": 2
        },
        "Nacimiento de hijo" : {
            "requiere_justificativo": True,
            "min_preaviso": 0,
            "tolerancia_justificativo": 3,
            "total_dias_anual": None,
            "max_dias_corridos": 2,
            "limite_anual_pedidos": 2
        },
        "Estudios" : {
            "requiere_justificativo": True,
            "min_preaviso": 3,
            "tolerancia_justificativo": 6,
            "total_dias_anual": 24,
            "max_dias_corridos": 4,
            "limite_anual_pedidos": None
        },
        "Maternidad" : {
            "requiere_justificativo": True,
            "min_preaviso": 0,
            "tolerancia_justificativo": 7,
            "total_dias_anual": 90,
            "max_dias_corridos": None,
            "limite_anual_pedidos": 2
        },
        "Control prenatal" : {
            "requiere_justificativo": True,
            "min_preaviso": 3,
            "tolerancia_justificativo": 2,
            "total_dias_anual": None,
            "max_dias_corridos": 1,
            "limite_anual_pedidos": None
        },
        "Accidente de Trabajo" : {
            "requiere_justificativo": True,
            "min_preaviso": 0,
            "tolerancia_justificativo": 1,
            "total_dias_anual": None,
            "max_dias_corridos": None,
            "limite_anual_pedidos": None
        },
        "Enfermedad" : {
            "requiere_justificativo": True,
            "min_preaviso": 0,
            "tolerancia_justificativo": 1,
            "total_dias_anual": None,
            "max_dias_corridos": None,
            "limite_anual_pedidos": None
        },
        "Casamiento" : {
            "requiere_justificativo": True,
            "min_preaviso": 7,
            "tolerancia_justificativo": 7,
            "total_dias_anual": None,
            "max_dias_corridos": 12,
            "limite_anual_pedidos": 1
        },
        "Tramites prematrimoniales" : {
            "requiere_justificativo": True,
            "min_preaviso": 7,
            "tolerancia_justificativo": 0,
            "total_dias_anual": None,
            "max_dias_corridos": 1,
            "limite_anual_pedidos": 1
        },


    }
    print("asd")

def license_analysis():
    print()

#Las solicitudes que recibiremos seran del tipo:
solicitud = {
    "tipo_licencia" : "Enfermedad"
    "fecha_inicio": "",
    "fecha_fin":.
    "dias_totales":
}

#los campos faltates: dias corridos,nro de pedido,dias preaviso debes ser calculados u obtenidos aparte


