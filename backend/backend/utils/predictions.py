import pandas as pd
import re
import joblib

from sklearn.linear_model import LogisticRegression
from file_utils import is_pdf_image
from file_utils import normalize_text
from file_utils import base64_to_text
TYPE_CONFIG = {
    "NACIMIENTO": {
        "NAME": "NACIMIENTO_HIJO",
        "MUST": [
            ["nacimiento"],
            ["lugar", "domicilio"],
            ["padre", "conyuge", "padre/conyuge"],
            ["matricula", "mn", "mp", "me"],
            ["registro civil"],
            ["sexo"],
            ["acta"],
            ["clinica", "hospital", "centro medico", "salita", "centro de salud"],
            ["dr", "dra"],
            ["libro"],
            ["folio"]
        ],
        "COULD": ["madre", "registro", "inscripcion", "tramite", "testigo", "testigos"],
        "N_MIN": 2
    },
    "ESTUDIOS": {
        "NAME": "ESTUDIOS",
        "MUST": [
            ["alumno", "alumna", "alumno/a", "estudiante"],
            ["facultad", "universidad", "instituto"],
            ["examen", "final", "evaluacion"],
            ["asignatura", "materia", "actividad"],
            ["carrera", "propuesta"],
            ["docente", "profesor", "profesora"]
        ],
        "COULD": ["regional", "modalidad", "ubicacion", "sede", "turno", "rendir", "realizar"],
        "N_MIN": 1
    },
    "CONTROL_PRENATAL": {
        "NAME": "CONTROL_PRENATAL",
        "MUST": [
            ["control", "consulta"],
            ["embarazo", "prenatal"],
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"]
        ],
        "COULD": ["clinica", "consultorio", "obstetra", "ginecologo", "hospital", "centro de salud", "centro medico", "ecografia", "laboratorio", "gestacion", "parto", "semana"],
        "N_MIN": 1
    },
    "ACCIDENTE_TRABAJO": {
        "NAME": "ACCIDENTE_TRABAJO",
        "MUST": [
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"],
            ["clinica", "hospital", "centro medico", "salita", "centro de salud"],
            ["art"],
            ["poliza"],
            ["accidente", "incidente", "lesion"],
            ["legajo"]
        ],
        "COULD": ["servicio", "empresa", "diagnostico", "tratamiento", "incapacidad", "laboral", "reposo", "licencia", "control", "reincorporacion", "alta", "junta medica"],
        "N_MIN": 1
    },
    "ENFERMEDAD": {
        "NAME": "ENFERMEDAD",
        "MUST": [
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"],
            ["reposo", "licencia", "descanso"]
        ],
        "COULD": ["clinica", "hospital", "centro medico", "salita", "centro de salud", "sintomas", "tratamiento", "control", "estudios", "gripe", "viral", "paciente", "dolor", "consultorio", "diagnostico"],
        "N_MIN": 1
    },
    "CASAMIENTO": {
        "NAME": "CASAMIENTO",
        "MUST": [
            ["acta"],
            ["matrimonio"],
            ["registro civil"],
            ["libro"],
            ["folio"],
            ["testigo", "testigos"],
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"]
        ],
        "COULD": ["juez de paz", "jueza de paz"],
        "N_MIN": 1
    },
    "DUELO": {
        "NAME": "DUELO",
        "MUST": [
            ["registro civil"],
            ["sexo"],
            ["nacionalidad"],
            ["causa", "diagnostico", "consecuencia"],
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"],
            ["defuncion"],
            ["tomo"],
            ["libro"],
            ["estado civil"],
            ["acta"]
        ],
        "COULD": ["deceso"],
        "N_MIN": 1
    },
    "DONACION_SANGRE": {
        "NAME": "DONACION_SANGRE",
        "MUST": [
            ["hospital", "instituto de hemoterapia", "banco de sangre", "clinica", "centro medico"],
            ["donar", "donacion"],
            ["sangre"],
            ["matricula", "mn", "mp", "me"]
        ],
        "COULD": ["donante", "receptor", "tecnico responsable"],
        "N_MIN": 1
    },
    "MUDANZA": {
        "NAME": "MUDANZA",
        "MUST": [
            ["boleto de compraventa", "contrato de locacion", "cambio de domicilio", "servicio de mudanza", "contrato de alquiler"],
            ["inmueble", "residencia", "vivienda", "propiedad"],
            ["inquilino", "locatorio", "comprador", "propietario"],
            ["locador", "vendedor"],
            ["domicilio", "direccion"]
        ],
        "COULD": ["nueva residencia", "renaper", "inmobiliaria", "traslado", "mudanza", "encargado de logistica", "plazo", "escrituracion", "certificado de domicilio", "fecha de desocupacion", "testigo", "notificacion de mudanza", "escribano", "esc", "matricula", "mn", "mp", "me", "dr", "dra", "registro nacional de las personas"],
        "N_MIN": 1
    },
    "REUNION_EXT": {
        "NAME": "REUNION_EXT",
        "MUST": [
            ["reunion"],
            ["extraordinario", "extraordinaria"],
            ["acta"],
            ["lugar"],
            ["sindicato", "gremio", "gremial"],
            ["afiliado", "empleado", "trabajador"]
        ],
        "COULD": ["comision", "dependencia", "union",
                "operarios", "convocada", "comercio",
                "convoctoria", "medidas", "urgente"],
        "N_MIN": 1
    },
    "OBLIGACION_PUBLICA": {
        "NAME": "OBLIGACION_PUBLICA",
        "MUST": [
            ["citacion", "notificacion"],["expediente"],
            ["obligatoria", "obligatorio"], ["matricula"]
        ],
        "COULD": ["jurado", "juicio", "sede",
                  "tribunal", "juez", "testigo",
                  "causa penal", "entrevista",
                  "inspector", "ley", "articulo",
                  "requerimiento", "expediente",
                  "ciudadano", "audiencia", "reclamo",
                  "funcionario", "elecciones"],
        "N_MIN": 1
    },
    "REPRESENTANTE_GREMIAL": {
        "NAME": "REPRESENTANTE_GREMIAL",
        "MUST": [
            ["gremial", "gremio", "sindicato"],
            ["reunion", "junta"],
            ["delegado", "miembro"],
            ["lugar"],
            ["motivo", "asunto", "actividad"]
        ],
        "COULD": ["empleados", "legajo", "orden del dia", 
                  "paritarias", "condiciones", "comision", 
                  "articulo", "credencial", "secretario",
                  "directora", "convocatoria", "urgente",
                  "despedido", "laboral", "conflictos", 
                  "asamblea", "informativa", "estrategias", 
                  "denuncia", "pago", "citacion", "jornada",
                  "capacitacion", "derechos", "seguridad"],
        "N_MIN": 1
    },
    "MATERNIDAD":{
        "NAME":"MATERNIDAD",
        "MUST":[
            ["semanas"],["gestacion"],["parto"],
            ["embarazo","embarazada"], ["dr", "dra"],
            ["matricula", "mn", "mp", "me"],["multiple","unico"]
            ],
        "COULD":["control","consulta","prenatal","pre-natal",
                 "pre natal", "hospital", "paciente","clinica",
                 "licencia","obstetricia","controles","prenatales",
                 "evolucion","gestacional"],
        "N_MIN":1
    },
    "TRAMITES_PREMATRIMONIALES":{
        "NAME":"TRAMITES_PREMATRIMONIALES",
        "MUST":[["turno"],["fecha"],["hora"],["direccion","ubicacion"],
                ["dni"],["original"],["copia"],["contrayente"],
                ["casamiento","matrimonio","matrimonial"],["testigo","testigos"],
                ["partida de nacimiento","acta de nacimiento"]],
        "COULD":["sede","certificado de nacimiento","partida de nacimiento",
                 "casamiento","registro provincial","registro civil","oficina",
                 "confirmado","numero de confirmacion","instrucciones",
                 "prematrimonial","libro","folio","capacidad legal",
                 "codigo civil","impedimentos legales","consentimiento",
                 "ceremonia","estado civil"],
        "N_MIN":1
    },
    "ASISTENCIA_FAMILIARES":{
        "NAME":"ASISTENCIA_FAMILIARES",
        "MUST":[["asistencia","cuidado","soporte","supervision"],
                ["familiar","responsable"],["dr", "dra"],["matricula", "mn", "mp", "me"]],
        "COULD":["paciente","permanente","condicion medica",
                 "autonoma","soporte","bienestar","continua",
                 "recuperacion","presencia","supervision",
                 "cronica","movilidad","aislamiento","complicacion",
                 "autonomia","rehabilitacion","especial","especiales",
                 "domicilio"],
        "N_MIN":1
    },
    "REUNION_GREMIAL":{
        "NAME":"REUNION_GREMIAL",
        "MUST":[["reunion",],["gremial","gremio","sindicato"]],
        "COULD":["empleados","comercio","trabajo","horario","secretario","delegado","participar","sindical","representante","convenio"],
        "N_MIN":1
    }
}

TYPES = list(TYPE_CONFIG.values())

#Lista de tipos por licencia, con esto + funcion rapida creamos todos los atributos del dataframe automatico

def create_strict_feature(text, must_find, could_find, n_minimum):
    """Se encarga de juzgar si un atributo se cumple o no por: palabras que tienen que aparecer, palabras que podrian
    aparecer(y el minimo de estas)"""

    normalized_text =normalize_text(text) 


    for word_group in must_find: #chequeamos palabras claves
        pattern = r'\b(?:' + '|'.join([re.escape(w) for w in word_group]) + r')(?:[.:]\S*|\s+)?\b' #buscamos cualquier palabra del grupo sinonimo
        if not re.search(pattern, normalized_text):
            return 0  #no encontró una palabra clave, se descarta
        
    count = 0 #vemos cuantas palabras secundarias se encontraron para ver si llegamos al minimo (aca no trabajamos sinonimos).Si no llegamos, se descarta
    for word in could_find:
        pattern = r'\b' + re.escape(word) + r'(?:[.:]\S*|\s+)?\b'
        if re.search(pattern, normalized_text):
            count += 1 
            if count >= n_minimum:
                return 1
    
    return 0

#Cargar el dataset basico
df=pd.read_csv("HealthFirst/backend/backend/utils/tipo_licencias_dataset.csv")

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

model = LogisticRegression(solver="lbfgs", C=0.1, max_iter=1000)
model.fit(X, y)
joblib.dump(model,"prediction_type_model.pkl")

#funcion para mostrar el top-3 de predicciones

def predict_top_3(text,model):
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
    return [(clase, f"{prob * 100:.0f} %") for clase, prob in top_3] 

#me la tengo que llevar a predicciones
def predict_license_type(base64_text):
    "Toma un base64 y predice a que 3 tipos de licencia puede pertenecer"
    model=joblib.load("prediction_type_model.pkl") #cargamos el modelo
    license_text=normalize_text(base64_to_text(base64_text,is_pdf_image(base64_text))) #tenemos el texto del certificado normalizado
    return predict_top_3(license_text) #lista de tupla como "("enfermedad",85)"


"""Configuración para "nacimiento_hijo" rapida pruebaaa
NACIMIENTO_must = [["nacimiento"], ["acta"], ["sexo"]]
NACIMIENTO_could = ["madre", "padre", "hospital"]
N_MINIMUM = 1
""""""
texto = "Certificado de NACIMIENTO: Acta 123, sexo masculino. Madre: María Pérez."
result = create_strict_feature(texto, NACIMIENTO_must, NACIMIENTO_could, N_MINIMUM)
print(result)  # Output: 1 (cumple todas las obligatorias y 1 secundarias)
"""