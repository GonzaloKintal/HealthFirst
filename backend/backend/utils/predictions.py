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
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"],
            ["clinica", "hospital", "centro medico", "salita", "centro de salud"],
            ["art"],
            ["poliza"],
            ["accidente", "incidente", "lesion"],
            ["legajo"]
        ],
        "COULD": [
            "servicio", "empresa", "diagnostico", "tratamiento", "incapacidad", "laboral",
            "reposo", "licencia", "control", "reincorporacion", "alta", "junta medica"
        ],
        "N_MIN":2
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
            "paciente", "permanente", "condicion medica", "autonoma", "soporte", "bienestar", "continua",
            "recuperacion", "presencia", "supervision", "cronica", "movilidad", "aislamiento", "complicacion",
            "autonomia", "rehabilitacion", "especial", "especiales", "domicilio"
        ],
        "N_MIN": 2
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
    "CONTROL_PRENATAL": {
        "NAME": "CONTROL_PRENATAL",
        "MUST": [
            ["control", "consulta"],
            ["embarazo", "prenatal"],
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"]
        ],
        "COULD": [
            "clinica", "consultorio", "obstetra", "ginecologo", "hospital", "centro de salud",
            "centro medico", "ecografia", "laboratorio", "gestacion", "parto", "semana"
        ],
        "N_MIN": 2
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
    "ENFERMEDAD": {
        "NAME": "ENFERMEDAD",
        "MUST": [
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"],
            ["reposo", "licencia", "descanso"]
        ],
        "COULD": [
            "clinica", "hospital", "centro medico", "salita", "centro de salud", "sintomas",
            "tratamiento", "control", "estudios", "gripe", "viral", "paciente", "dolor", "consultorio",
            "diagnostico"
        ],
        "N_MIN": 1
    },
    "ESTUDIOS": {
        "NAME": "ESTUDIOS",
        "MUST": [
            ["facultad", "universidad", "instituto"],
            ["examen", "final", "evaluacion","rendimiento"],
            ["asignatura", "materia", "actividad"],
            ["carrera", "propuesta"],
        ],
        "COULD": ["regional", "modalidad", "ubicacion", "sede",
                  "turno", "rendir", "realizar","hora","alumno",
                  "alumna", "alumno/a", "estudiante",
],
        "N_MIN": 0
    },
    "MATERNIDAD": {
        "NAME": "MATERNIDAD",
        "MUST": [
            ["semanas"],
            ["gestacion"],
            ["parto"],
            ["embarazo", "embarazada"],
            ["dr", "dra"],
            ["matricula", "mn", "mp", "me"],
            ["multiple", "unico"]
        ],
        "COULD": [
            "control", "consulta", "prenatal", "pre-natal", "pre natal", "hospital", "paciente", "clinica",
            "licencia", "obstetricia", "controles", "prenatales", "evolucion", "gestacional"
        ],
        "N_MIN": 2
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
            "nueva residencia", "renaper", "inmobiliaria", "traslado", "mudanza", "encargado de logistica", "plazo",
            "escrituracion", "certificado de domicilio", "fecha de desocupacion", "testigo", "notificacion de mudanza",
            "escribano", "esc", "matricula", "mn", "mp", "me", "dr", "dra", "registro nacional de las personas"
        ],
        "N_MIN": 1
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
        "COULD": ["madre", "registro", "inscripcion", "tramite", "testigo", "testigos"],
        "N_MIN": 2
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
            "jurado", "juicio", "sede", "tribunal", "juez", "testigo", "causa penal", "entrevista",
            "inspector", "ley", "articulo", "requerimiento", "expediente", "ciudadano", "audiencia",
            "reclamo", "funcionario", "elecciones"
        ],
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
        "COULD": [
            "empleados", "legajo", "orden del dia", "paritarias", "condiciones", "comision",
            "articulo", "credencial", "secretario", "directora", "convocatoria", "urgente",
            "despedido", "laboral", "conflictos", "asamblea", "informativa", "estrategias",
            "denuncia", "pago", "citacion", "jornada", "capacitacion", "derechos", "seguridad"
        ],
        "N_MIN": 2
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
            "comision", "dependencia", "union", "operarios", "convocada", "comercio",
            "convoctoria", "medidas", "urgente"
        ],
        "N_MIN": 1
    },
    "REUNION_GREMIAL": {
        "NAME": "REUNION_GREMIAL",
        "MUST": [
            ["reunion"],
            ["gremial", "gremio", "sindicato"]
        ],
        "COULD": [
            "empleados", "comercio", "trabajo", "horario", "secretario", "delegado",
            "participar", "sindical", "representante", "convenio"
        ],
        "N_MIN": 1
    },
    "TRAMITE_PREMATRIMONIAL": {
        "NAME": "TRAMITE_PREMATRIMONIAL",
        "MUST": [
            ["turno"],
            ["fecha"],
            ["hora"],
            ["direccion", "ubicacion"],
            ["dni"],
            ["original"],
            ["copia"],
            ["contrayente"],
            ["casamiento", "matrimonio", "matrimonial"],
            ["testigo", "testigos"],
            ["partida de nacimiento", "acta de nacimiento"]
        ],
        "COULD": [
            "sede", "certificado de nacimiento", "partida de nacimiento", "casamiento",
            "registro provincial", "registro civil", "oficina", "confirmado", "numero de confirmacion",
            "instrucciones", "prematrimonial", "libro", "folio", "capacidad legal", "codigo civil",
            "impedimentos legales", "consentimiento", "ceremonia", "estado civil"
        ],
        "N_MIN": 3
    }
}

def pruebaRapida(): #borrar despues
    return TYPE_CONFIG

def predict_license_type(base64_text):
    "Toma un pdf en formato base64 y predice a que 3 tipos de licencia puede pertenecer"
    model=joblib.load("prediction_type_model.pkl") #why? si no lo uso
    license_text=f_u.normalize_text(f_u.base64_to_text(base64_text,f_u.is_pdf_image(base64_text))) #Tenemos el texto del certificado normalizado
    return predict_top_3(license_text, model) #Lista de tupla como "("enfermedad",85%)"

#a_predecir="HealthFirst/backend/backend/utils/pdf_imagen.pdf"
#print(predict_license_type(f_u.pdf_to_base64(a_predecir)))

def create_strict_feature(normalized_text, must_find, could_find, n_minimum):
    print(must_find)
    """Recorre cada grupo de palabras claves y finalmente avisa si se encontraron en el texto normalizado de entrada """
    for word_group in must_find:
        pattern = r'(?<!\w)(?:' + '|'.join([re.escape(w) for w in word_group]) + r')(?:[.:-]\S*|\s+)?'
        if not re.search(pattern, normalized_text):
            return 0
    count = 0
    for word in could_find:
        pattern = r'(?<!\w)' + re.escape(word) + r'(?!\w)'
        if re.search(pattern, normalized_text):
            count += 1
            if count >= n_minimum:
                return 1
    return 0
must_estudios = TYPE_CONFIG["ESTUDIOS"]["MUST"]
could_estudios = TYPE_CONFIG["ESTUDIOS"]["COULD"]

texto=f_u.normalize_text("Instituto Superior de Técnicas Bancarias (ISTB) CERTIFICADO DE EXAMEN ESPECIAL Nombre: Diego A. Ríos DNI 32.456.321 Carrera: Tec. en Finanzas Materia: Análisis de Riesgo Crediticio Fecha: 28/08/2024 Horario: 09:00 a 12:00 hs Calificación: 9 (nueve) Validez: Para presentación ante empleadores según Convenio 543/2024 Firma: Lic. Silvana Castro (Reg. ISTB-2024)")

(create_strict_feature(texto,must_estudios,could_estudios,1))

#a_buscar=["instituto","examen","materia:","carrera:"]
#print(f"a ver si encontramos:{f_u.search_in_pdf_text(texto,a_buscar)}")

#Cargar el dataset basico
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(CURRENT_DIR, "coherence_license_type_dataset.csv")
df = pd.read_csv(csv_path)

#Generanding los atributos del dataframe

for type_name, type_data in TYPE_CONFIG.items():
    df[f"justify_{type_name}"] = df["text_license"].apply(
        lambda x: create_strict_feature(
            f_u.normalize_text(x),
            type_data["MUST"],
            type_data["COULD"],
            type_data["N_MIN"]
        )
    )

  
# Para verificar los primeros textos
#print(df.filter(like="justify_").head())

#Entrenar el modelo
X=df.filter(like="justify_")
y=df["real_license_type"]
#Divido el dataset para poder ver la exactitud de la prediccion
X_train, X_test, y_train, y_test=train_test_split(
    X,y,
    test_size=0.2,
    random_state=42,
    shuffle=True, #Mezcla datos antes de dividir
    stratify=y #Para mantener proporcion de clases
)
#print("Distribución en y_train:\n", y_train.value_counts())
#print("Distribución en y_test:\n", y_test.value_counts())

model = LogisticRegression(solver="lbfgs", C=0.1, max_iter=1000)
model.fit(X_train,y_train)
joblib.dump(model,"prediction_type_model.pkl")

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
y_pred=model.predict(X_test)
#Mostramos el reporte de clasificacion
#print(classification_report(y_test,y_pred))
#Matriz de confusion para ver que clases se confunden
#print(confusion_matrix(y_test, y_pred, labels=model.classes_))

