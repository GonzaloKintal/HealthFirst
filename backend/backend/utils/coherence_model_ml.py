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
    texto="Convocatoria urgente - Sindicato de Empleados de Comercio - Delegado/a: Carlos Alberto Rodríguez (legajo 67890) - Fecha: 18/10/2024 - Hora: 10:00 - Lugar: Sede Gremial (Mitre 567, Rosario) - Motivo: Tratamiento de despidos injustificados en cadena de supermercados 'La Económica' - Eximir presentación laboral según Art. 42 Ley 23.551 - Firma: Ana Fernández (Secretaria de Conflictos SEC Rosario) - Contacto: 341-5551234"
    print(predict_top_3(texto))