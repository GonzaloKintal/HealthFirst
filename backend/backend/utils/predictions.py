import pandas as pd
import re
import joblib
import file_utils as f_u

import os

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

TYPE_CONFIG = {
    "ACCIDENTE_TRABAJO": {
        "NAME": "ACCIDENTE_TRABAJO",
        "MUST": [
            ["dr", "dra","junta medica"],
            ["matricula", "mn", "mp", "me"],
            ["clinica", "hospital", "centro medico", "salita", "centro de salud"],
            ["art"],
            ["poliza"],
            ["accidente", "incidente", "lesion",""],
        ],
        "COULD": [
            ["empresa","legajo","servicio"],
            ["diagnostico", "tratamiento"],
            ["reposo", "licencia","incapacidad laboral"],
            ["control", "reincorporacion", "alta"], 
        ],
    },
    "ASISTENCIA_FAMILIAR": {
        "NAME": "ASISTENCIA_FAMILIAR",
        "MUST": [
            ["asistencia", "cuidado", "soporte", "supervision"],
            ["familiar", "responsable"],
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"]
        ],
        "COULD": [
            ["autonomia","autonoma","supervision","presencia","soporte"],
            ["permanente","continua","especial","cronica","recuperacion"],
            ["condicion medica", "bienestar","movilidad", "aislamiento", "complicacion",
            "rehabilitacion", "especiales", "domicilio"]
        ],
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
    },
    "CONTROL_PRENATAL": {
        "NAME": "CONTROL_PRENATAL",
        "MUST": [
            ["control", "consulta"],
            ["embarazo", "prenatal"],
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"]
        ],
        "COULD": [
            ["clinica", "consultorio","hospital", "centro de salud","centro medico"],
            ["obstetra", "ginecologo"],
            ["ecografia", "laboratorio","hierro"],
            ["gestacion", "parto", "semana"]
        ],
    },
    "DONACION_SANGRE": {
        "NAME": "DONACION_SANGRE",
        "MUST": [
            ["hospital", "instituto de hemoterapia", "banco de sangre", "clinica", "centro medico"],
            ["donar", "donacion"],
            ["sangre"],
            ["matricula", "mn", "mp", "me"]
        ],
        "COULD": [
            ["donante", "receptor", "tecnico responsable"]
        ],
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
        "COULD": [
            ["deceso"]
        ],
    },
    "ENFERMEDAD": {
        "NAME": "ENFERMEDAD",
        "MUST": [
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"],
            ["reposo", "licencia", "descanso"]
        ],
        "COULD": [
            ["clinica", "hospital", "centro medico", "salita", "centro de salud","consultorio"],
            ["sintomas","tratamiento","diagnostico", "control", "estudios"],
            ["gripe", "viral", "paciente", "dolor","pulmonia","bronquitis","covid","gastroenteritis","intoxicacion"]
        ],
    },
    "ESTUDIOS": {
        "NAME": "ESTUDIOS",
        "MUST": [
            ["estudiante","facultad", "universidad", "instituto","escuela"],
            ["examen", "final", "evaluacion","rendimiento","parcial/final"],
            ["asignatura", "materia", "actividad"],
            ["carrera", "propuesta"],
        ],
        "COULD": [
            ["regional", "modalidad"],
            ["ubicacion", "sede"],
            ["turno"],
            ["rendir","realizar"],
            ["hora"],
            ["alumno","alumna", "alumno/a"]
        ],
    },
    "MATERNIDAD": {
        "NAME": "MATERNIDAD",
        "MUST": [
            ["semanas"],
            ["gestacion","gestacional"],
            ["parto"],
            ["embarazo", "embarazada"],
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"],
            ["multiple", "unico"]
        ],
        "COULD": [
            ["control", "consulta"],
            ["prenatal", "pre-natal", "pre natal","prenatales"],
            ["clinica", "hospital", "centro medico", "salita", "centro de salud","consultorio"],
            ["licencia","descanso"]
        ],
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
        "COULD": [
            ["matricula", "mn", "mp", "me"],
            ["registro nacional de las personas","renaper","inmobiliaria",
             "escribano", "esc","dr", "dra","encargado de logistica","testigo"],
            ["traslado","mudanza","nueva residencia"],
            ["escrituracion", "certificado de domicilio","fecha de desocupacion","notificacion de mudanza"]
        ],
    },
    "NACIMIENTO": {
        "NAME": "NACIMIENTO",
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
        "COULD": [
            ["madre"],
            ["registro", "inscripcion", "tramite", "testigo", "testigos"]
        ],
    },
    "OBLIGACION_PUBLICA": {
        "NAME": "OBLIGACION_PUBLICA",
        "MUST": [
            ["citacion", "notificacion"],
            ["expediente"],
            ["obligatoria", "obligatorio"],
            ["matricula"]
        ],
        "COULD": [
            ["juicio","causa penal","entrevista","audiencia","reclamo","elecciones","testigo"],
            ["jurado","tribunal","juez","funcionario","inspector"],
            ["articulo","ley","requerimiento"]
        ],
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
        "COULD": [
            ["asamblea","citacion","convocatoria"],
            ["secretario", "directora"],
            ["denuncia", "pago","capacitacion","seguridad","conflictos","estrategias","derechos","despido","paritarias","condiciones",
             "orden del dia"],
             ["legajo", "comision","articulo", "credencial", "urgente","laboral","informativa","citacion", "jornada" ]
        ],
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
        "COULD": [
            ["comision", "dependencia", "union", "operarios", "convocada", "comercio",
            "convoctoria", "medidas", "urgente"]
        ],
    },
    "REUNION_GREMIAL": {
        "NAME": "REUNION_GREMIAL",
        "MUST": [
            ["reunion"],
            ["gremial", "gremio", "sindicato"]
        ],
        "COULD": [
            ["secretario","delegado","sindical","representante"],
            ["horario, hora"],
            ["lugar, sede"],
            ["empleados","comercio","trabajo","laboral","convenio"]
        ]
    },
    "TRAMITE_PREMATRIMONIAL": {
        "NAME": "TRAMITE_PREMATRIMONIAL",
        "MUST": [
            ["fecha"],
            ["hora"],
            ["direccion", "ubicacion"],
            ["dni"],
            ["contrayente"],
            ["casamiento", "matrimonio", "matrimonial"],
            ["testigo", "testigos"],
        ],
        "COULD": [
            ["original","copia"],
            ["partida de nacimiento", "acta de nacimiento","certificado de nacimiento"],
            ["registro civil", "oficina","registro provincial"],
            ["instrucciones","libro","folio","ceremonia","estado civil"],
            ["capacidad legal","codigo civil","impedimentos legales","consentimiento","prematrimonial"]
        ],
    }
}

def pruebaRapida():
    return TYPE_CONFIG;

def create_strict_feature(normalized_text, must_find, could_find, must_weight, could_weight):
    """Recorre cada grupo de palabras clave y evalúa si se encuentran en el texto normalizado de entrada.
    Calcula un puntaje basado en las palabras encontradas y sus respectivos pesos, devolviendo un porcentaje."""
    must_found = 0
    could_found = 0
    
    # Calcula cuántas palabras clave "obligatorias" se encuentran
    for word_group in must_find:
        pattern = r'(?<!\w)(?:' + '|'.join([re.escape(w) for w in word_group]) + r')(?:[.:-]\S*|\s+)?'
        if re.search(pattern, normalized_text):
            must_found += 1

    # Calcula cuántas palabras clave "opcionales" se encuentran
    for word_group in could_find:
        pattern = r'(?<!\w)(?:' + '|'.join([re.escape(w) for w in word_group]) + r')(?:[.:-]\S*|\s+)?'
        if re.search(pattern, normalized_text):
            could_found += 1

    # Calcula el puntaje máximo basado en los pesos
    max_score = (len(must_find) * must_weight) + (len(could_find) * could_weight)
    
    # Calcula el puntaje total y el porcentaje
    if max_score > 0:
        percentage =int(((must_found * must_weight + could_found * could_weight) / max_score) * 100)
    else:
        percentage = 0  # Si no hay palabras clave, el puntaje es 0
    
    return percentage

must_estudios = TYPE_CONFIG["ESTUDIOS"]["MUST"]
could_estudios = TYPE_CONFIG["ESTUDIOS"]["COULD"]
texto=f_u.normalize_text("Constancia de Examen Final: Apellido y Nombre: JIMENEZ FERRER CARLOS ALBERTO Identificacion: DNI 95879762 por la presente se certifica que la persona cuyos datos se citan anteriormente se presento a rendir el siguiente examen: Propuesta (R) Ingenieria Electronica Actividad: Ingenieria y Sociedad Fecha de examen: 12/01/2021 Ubicacion: campus. Se extiende  la presente constancia a pedido del interesado para ser presentada ante JEFE DE DEPARTAMENTO en CABA- Ciudad Autonoma de Buenos Aires., Ciudad Autonoma de Buenos Aires a los 14 dias del mes de enero de 2021. ")
print(create_strict_feature(texto,must_estudios,could_estudios,3,1))

#Cargar el dataset basico
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(CURRENT_DIR, "coherence_license_type_dataset.csv")
df = pd.read_csv(csv_path)

#Generanding los atributos del dataframe

# for type_name, type_data in TYPE_CONFIG.items():
#     df[f"justify_{type_name}"] = df["text_license"].apply(
#         lambda x: create_strict_feature(
#             f_u.normalize_text(x),
#             type_data["MUST"],
#             type_data["COULD"],
#             type_data["N_MIN"]
#         )
#     )

  
# # Para verificar los primeros textos
# #print(df.filter(like="justify_").head())

# #Entrenar el modelo
# X=df.filter(like="justify_")
# y=df["real_license_type"]
# #Divido el dataset para poder ver la exactitud de la prediccion
# X_train, X_test, y_train, y_test=train_test_split(
#     X,y,
#     test_size=0.2,
#     random_state=42,
#     shuffle=True, #Mezcla datos antes de dividir
#     stratify=y #Para mantener proporcion de clases
# )
# #print("Distribución en y_train:\n", y_train.value_counts())
# #print("Distribución en y_test:\n", y_test.value_counts())

# model = LogisticRegression(solver="lbfgs", C=0.1, max_iter=1000)
# model.fit(X_train,y_train)
# joblib.dump(model,"prediction_type_model.pkl")

def predict_top_3(certificate_text,model):
    """Toma el texto del certificado y el modelo de ml para predecir a que 3 tipos podria pertenecer el certificado"""
    features={}
    for type in TYPES:
        features[f"justify_{type['NAME']}"] = create_strict_feature(
            certificate_text,
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

#Ver la precision del modelo

#Predecir etiquetas para el test
# y_pred=model.predict(X_test)
#Mostramos el reporte de clasificacion
#print(classification_report(y_test,y_pred))
#Matriz de confusion para ver que clases se confunden
#print(confusion_matrix(y_test, y_pred, labels=model.classes_))


def predict_license_type(base64_text):
    "Toma un pdf en formato base64 y predice a que 3 tipos de licencia puede pertenecer"
    model=joblib.load("prediction_type_model.pkl") #why? si no lo uso
    license_text=f_u.normalize_text(f_u.base64_to_text(base64_text,f_u.is_pdf_image(base64_text))) #Tenemos el texto del certificado normalizado
    return predict_top_3(license_text, model) #Lista de tupla como "("enfermedad",85%)"
