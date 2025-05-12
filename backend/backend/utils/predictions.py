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

must=TYPE_CONFIG["DONACION_SANGRE"]["MUST"]
could=TYPE_CONFIG["DONACION_SANGRE"]["COULD"]
texto=f_u.normalize_text("Hospital de Hemoterapia Buenos Aires Fecha: 15 de octubre de 2024 Certifico que el Sr. Luis Fernández, DNI 20.345.678, realizó una donación voluntaria de sangre en nuestra institución el día 14 de octubre de 2024. Según el artículo 82° del Convenio Colectivo de Trabajo de Comercio, el Sr. Fernández tiene derecho a un día de licencia laboral por esta donación. Firma: Dra. Verónica Pérez Matrícula: 7896543 Sello del Hospital: Hospital de Hemoterapia Buenos Aires - Tel. 4551-2345")
#print(create_strict_feature(texto,must,could,2,1))

def generate_coherence_model(cvs_path, TYPES):
    """Genera el modelo de coherencia tomando el dataset.csv y el diccionario de los tipos de licencia"""
    # Cargar el dataset básico a un dataframe
    df = pd.read_csv(cvs_path, encoding="utf-8")
    df['text_license'] = df['text_license'].apply(f_u.normalize_text)

    # Generar los atributos del modelo según el diccionario
    for type_name, type_data in TYPES.items():
        df[f"justify_{type_name}"] = df["text_license"].apply(
            lambda x: create_strict_feature(
                x,
                type_data["MUST"],
                type_data["COULD"],
                2,
                1
            )
        )
        
    
    # 1. Definir features (X) y target (y)
    X = df.filter(like="justify_")  # Columnas justify_*
    y = df["real_license_type"]      # Etiquetas reales

    # 2. Dividir en train y test (80% entrenamiento, 20% evaluación)    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 3. Entrenar el modelo
    model = LogisticRegression( solver="lbfgs", max_iter=1000)
    model.fit(X_train, y_train)
    joblib.dump(model, "license_type_model.joblib")

    # 4. Evaluar el modelo con el conjunto de TEST
 #   y_pred = model.predict(X_test)

    # Reporte de clasificación (¡ESTE ES EL JUICIO AL MODELO!) 
#    print("Viene el reporte:") 
#    print(classification_report(y_test, y_pred))

    return  df 
generate_coherence_model("C:/Users/Usuario/Documents/GitHub/Tp_Principal_Labo/HealthFirst/backend/backend/utils/coherence_license_type_dataset.csv",TYPE_CONFIG)

#df= generate_coherence_model("HealthFirst/backend/backend/utils/coherence_license_type_dataset.csv",TYPE_CONFIG)
def predict_top_3(certificate_text):
    """Devuelve los 3 tipos de licencia con mayor porcentaje de coincidencia."""
    # 1. Normalizar texto
    normalized_text = f_u.normalize_text(certificate_text)
    
    # 2. Calcular puntajes para cada tipo
    scores = []
    for type_name, type_data in TYPE_CONFIG.items():
        percentage = create_strict_feature(
            normalized_text,
            type_data["MUST"],
            type_data["COULD"],
            2,  # must_weight
            1   # could_weight
        )
        scores.append((type_name, percentage))
    
    # 3. Ordenar de mayor a menor y tomar top 3
    scores.sort(key=lambda x: -x[1])
    top_3 = scores[:3]
    
    # 4. Formatear resultado (ej: [("ENFERMEDAD", "85%"), ...])
    return [(tipo, f"{pct}%") for tipo, pct in top_3]
    
print(predict_top_3("Instituto Superior de Gastronomía Gato Dumas CERTIFICADO DE EXAMEN PRÁCTICO Nombre: Sofía R. Vega DNI 39.876.543 Carrera: Tec. en Cocina Profesional Materia: Pastelería Avanzada Fecha: 25/11/2024 Hora: 14:00 hs Duración: 5 horas Calificación: 8 (ocho) Validez laboral: Según Ley 26.206 Art. 12 Firma: Chef Martín B. Ríos (Reg. ISGD-4567"))
