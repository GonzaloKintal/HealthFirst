import pandas as pd
import joblib
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from file_utils import normalize_text

_modelo = None

def inicializar_modelo(ruta_csv='HealthFirst/backend/backend/utils/coherence_license_type_dataset.csv'):
    """Carga y entrena el modelo una sola vez """

    global _modelo
    
    if _modelo is None:
        # 1. Cargar y preparar datos
        def cargar_datos(archivo_csv):
            df = pd.read_csv(
                archivo_csv,
                delimiter=',',
                quotechar='"',
                engine='python',
                on_bad_lines='skip'
            )

            df['text'] = df['text'].apply(normalize_text)
            return df['text'].tolist(), df['clase'].tolist()

        textos, etiquetas = cargar_datos(ruta_csv)
        
        # 2. Crear y entrenar modelo con parámetros optimizados
        _modelo = make_pipeline(
            TfidfVectorizer(
                max_features=1500,
                ngram_range=(1, 2),
                min_df=2
                ),
            RandomForestClassifier(
                n_estimators=200,
                class_weight='balanced',
                )
        )
        _modelo.fit(textos, etiquetas)
        
        # Guardar modelo
        joblib.dump(_modelo, 'modelo_clasificador.joblib')
    
    return _modelo

def predict_top_3(texto):
    """ Devuelve el top 3 de predicciones [('Estudios', '86.0%'), ('Asistencia_familiar', '6.0%'),
    ('Mudanza', '4.0%')]"""

    global _modelo
    
    if _modelo is None:
        _modelo = joblib.load('modelo_clasificador.joblib') 
    
    probas = _modelo.predict_proba([normalize_text(texto)])[0]
    
    resultados = [
        (str(clase),  
        f"{prob*100:.1f}%"  # Formato porcentaje
    ) for clase, prob in zip(_modelo.classes_, probas)]
    
    # Ordenar y tomar top 3
    return sorted(resultados, key=lambda x: float(x[1][:-1]), reverse=True)[:3]


if __name__ == "__main__":
    # 1. Inicializar modelo
    inicializar_modelo()
    #Para probar
    texto="REPÚBLICA ARGENTINA PROVINCIA DE MENDOZA REGISTRO CIVIL DE GUAYMALLÉN ACTA DE NACIMIENTO N° 7890-2024 INSCRIPCIÓN TARDÍA N° 234 FECHA DE TRAMITE: 22/06/2024 LIBRO 12 FOLIO 90 APELLIDO Y NOMBRES: LÓPEZ MATEO JAVIER SEXO: MASCULINO FECHA DE NACIMIENTO: 10/01/2020 LUGAR: DOMICILIO PARTICULAR CALLE SAN MARTÍN 123 PADRE: LÓPEZ ROBERTO DNI 29.678.901 MADRE: DÍAZ JULIETA DNI 31.789.012 DECLARACIÓN JURADA PRESENTADA EL 15/06/2024 FIRMADO POR: DRA. MARÍA INÉS SUÁREZ MATRÍCULA 67.890 Sello Electrónico: RCMZA-2024-45678"
    print(predict_top_3(texto))