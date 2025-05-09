import pandas as pd
import re
import file_utils

from sklearn.linear_model import LogisticRegression


NACIMIENTO_must=[["nacimiento"],["lugar","domicilio"],["padre","conyuge","padre/conyuge"],["matricula","mn","mp","me"],["registro civil"],["sexo"],
                 ["acta"],["clinica","hospital","centro medico","salita","centro de salud"],["dr","dra"],["libro"],["folio"]]
NACIMIENTO_could=["madre","registro","inscripcion","tramite","testigo","testigos"],
NACIMIENTO_N_MINIMUM=2
 
ESTUDIOS_must=[["alumno","alumna","alumno/a","estudiante"],["facultad","universidad","instituto"],["examen","final","evaluacion"],
               ["asignatura","materia","actividad"],["carrera","propuesta"],["docente","profesor","profesora"]]
ESTUDIOS_could=["regional","modalidad","ubicacion","sede","turno","rendir","realizar"]
ESTUDIOS_N_MINIMUM=1

CONTROL_PRENATAL_must=[["control","consulta"],["embarazo","prenatal"],["dr","dra"],["matricula","mn","mp","me"]]
CONTROL_PRENATAL_could=["clinica","consultorio","obstetra","ginecologo","hospital","centro de salud","centro medico","ecografia","laboratorio","gestacion","parto","semana"]
CONTROL_PRENATAL_N_MINIMUM=1

ACCIDENTE_TRABAJO_must=[["dr","dra"],["matricula","mn","mp","me"],["clinica","hospital","centro medico","salita","centro de salud"],
                        ["art"],["poliza"],["accidente","incidente","lesion"],["legajo"]]
ACCIDENTE_TRABAJO_could=["servicio","empresa","diagnostico","tratamiento","incapacidad","laboral","reposo","licencia","control",
                         "reincorporacion","alta","junta medica"]
ACCIDENTE_TRABAJO__N_MINIMUM=1

ENFERMEDAD_must=[["dr","dra"],["matricula","mn","mp","me"],["reposo","licencia","descanso"]]
ENFERMEDAD_could=["clinica","hospital","centro medico","salita","centro de salud","sintomas","tratamiento","control","clinica",
                  "hospital","estudios","gripe","viral","paciente","dolor","consultorio","diagnostico"]
ENFERMEDAD_N_MINIMUM=1

CASAMIENTO_must=[["acta"],["matrimonio"],["registro civil"],["libro"],["folio"],["testigo","testigos"],["dr","dra"],
                 ["matricula","mn","mp","me"]]
CASAMIENTO_could=["juez de paz","jueza de paz"]
CASAMIENTO_N_MINIMUM=1

DUELO_must=[["registro civil"],["sexo"],["nacionalidad"],["causa","diagnostico","consecuencia"],["dr","dra"],
            ["matricula","mn","mp","me"],["defuncion"],["tomo"],["libro"],["estado civil"],["acta"]]
DUELO_could=["deceso"] #capaz esta demas 
DUELO_N_MINIMUM=1

DONACION_SANGRE_must=[["hospital","instituto de hemoterapia","banco de sangre","clinica","centro medico"],["donar","donacion"],
                      ["sangre"],["matricula","mn","mp","me"]]
DONACION_SANGRE_could=["donante","receptor","tecnico responsable"]
DONACION_SANGRE_N_MINIMUM=1

MUDANZA_must=[["boleto de compraventa","contrato de locacion","cambio de domicilio","servicio de mudanza","contrato de alquiler"]
              ,["inmueble","residencia","vivienda","propiedad","residencia"],["inquilino","locatorio","comprador","propietario"],
              ["locador","vendedor"],["domicilio","direccion"]]
MUDANZA_could=["nueva residencia","renaper","inmobiliaria","traslado","mudanza","encargado de logistica","plazo","escrituracion",
               "certificado de domicilio","fecha de desocupacion","testigo","notificacion de mudanza","escribano","esc", "matricula",
               "mn","mp","me","dr","dra","registro nacional de las personas"]
MUDANZA_N_MINIMUM=1

REUNION_EXT_must=[["reunion"],["extraordinario","extraordinaria"],["acta"],["lugar"],["sindicato","gremio","gremial"],["afiliado","empleado","trabajador"]]
REUNION_EXT_could=["comision","dependencia","union","operarios","convocada","comercio","convoctoria","medidas","urgente"]
REUNION_EXT_N_MINIMUM=1

OBLIGACION_PUBLICA_must=[["citacion","notificacion"],["expediente"],["obligatoria","obligatorio"],["matricula"]]
OBLIGACION_PUBLICA_could=["jurado","juicio","sede","tribunal","juez","testigo","causa penal","entrevista","inspector","ley",
                          "articulo","requerimiento","expediente","ciudadano","audiencia","reclamo","funcionario","elecciones"]
OBLIGACION_PUBLICA_N_MINIMUM=1

REPRESENTANTE_GREMIAL_must=[["gremial","gremio","sindicato"],["reunion","junta"],["delegado","miembro"],["lugar"],["motivo","asunto","actividad"]]
REPRESENTANTE_GREMIAL_could=["empleados","legajo","orden del dia","paritarias","condiciones","comision","articulo","credencial","secretario",
                             "directora","convocatoria","urgente","despedido","laboral","conflictos","asamblea","informativa","estrategias",
                             "denuncia","pago","citacion","jornada","capacitacion","derechos","seguridad"]
REPRESENTANTE_GREMIAL_N_MINIMUM=1



MATERNIDAD_must=[[""]]
MATERNIDAD_could=[""]

#Lista de tipos por licencia, con esto + funcion rapida creamos todos los atributos del dataframe automatico

TYPES=[
    {
        "NAME": "NACIMIENTO_HIJO",
        "MUST": NACIMIENTO_must,
        "COULD": NACIMIENTO_could,
        "N_MIN": NACIMIENTO_N_MINIMUM
    },    

]


def create_strict_feature(text, must_find, could_find, n_minimum):
    """Se encarga de juzgar si un atributo se cumple o no por: palabras que tienen que aparecer, palabras que podrian
    aparecer(y el minimo de estas)"""

    normalized_text =file_utils.normalize_text(text) 
    print(normalized_text)

    for word_group in must_find: #chequeamos palabras claves
        pattern = r'\b(?:' + '|'.join([re.escape(w) for w in word_group]) + r')(?:[.:]\S*|\s+)?\b' #buscamos cualquier palabra del grupo sinonimo
        if not re.search(pattern, normalized_text):
            print("falla por clave")
            return 0  #no encontró una palabra clave, se descarta
        
    count = 0 #vemos cuantas palabras secundarias se encontraron para ver si llegamos al minimo (aca no trabajamos sinonimos).Si no llegamos, se descarta
    for word in could_find:
        pattern = r'\b' + re.escape(word) + r'(?:[.:]\S*|\s+)?\b'
        if re.search(pattern, normalized_text):
            count += 1 
            if count >= n_minimum:
                return 1
    print("falla por minimo")
    return 0


"""Configuración para "nacimiento_hijo" rapida pruebaaa
NACIMIENTO_must = [["nacimiento"], ["acta"], ["sexo"]]
NACIMIENTO_could = ["madre", "padre", "hospital"]
N_MINIMUM = 1

texto = "Certificado de NACIMIENTO: Acta 123, sexo masculino. Madre: María Pérez."
result = create_strict_feature(texto, NACIMIENTO_must, NACIMIENTO_could, N_MINIMUM)
print(result)  # Output: 1 (cumple todas las obligatorias y 1 secundarias)
"""

#Cargar el dataset basicu
df=pd.read_csv("tipo_licencias_dataset.csv")

#Generanding los atributos del dataframe

for type in TYPES:
    df[f"justify_{type['NAME']}"] = df["text_license"].apply(
        lambda x: create_strict_feature(
            x,
            type["MUST"],
            type["COULD"],
            type["N_MIN"]
        )
    )

# Para verificar los primeros textos
#print(df.filter(like="justify_").head())


#Toca entrenar el modelo~ revisar fijo de aca

X=df.filter(like="justify_")
y=df["real_license_type"]

model = LogisticRegression( multi_class="multinomial",solver="lbfgs", C=0.1, max_iter=1000)
model.fit(X, y) 

#funcion para mostrar el top-3 de predicciones

def predict_top_3(text):
    features={}
    for type in TYPES:
        features[f"justify_{type['NAME']}"] = create_strict_feature(
            text,
            type["MUST"],
            type["COULD"],
            type["N_MIN"]
        )
    
    # Convertir a DataFrame (una fila)
    input_df = pd.DataFrame([features])
    
    # Predecir probabilidades
    probas = model.predict_proba(input_df)[0]
    clases = model.classes_
    
    # Top-3
    top_3 = sorted(zip(clases, probas), key=lambda x: -x[1])[:3]
    for i, (clase, prob) in enumerate(top_3):
        print(f"{i+1}. {clase}: {prob:.2%}")




"""
MATERNIDAD=["parto","gestacion","semana","prenatal","embarazo",
"medico","hospital","paciente","embarazada","gestacion","control","dr",
"matricula","prenatal","reposo",]
#NO PUEDEN FALTAR: parto, gestacion, semana, embarazo, (hospital/centro medico/clinica/salita), (paciente/embarazada),
#                  (dr/dra), (matricula,mp,mn,me)

#PUEDEN FALTAR: prenatal, medico, control, prenatal, reposo, licencia






TRAMITES_PREMATRIMONIALES=[""] #sacar turno, y ese comprobante ¿que info tiene?



ASISTENCIA_A_FAMILIARES=[""] #FALTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA


REUNION_GREMIAL=["certificado","asistencia","reunion","gremial",""] #FALTAAAAAAAAAAAAAAAAAAA


"""