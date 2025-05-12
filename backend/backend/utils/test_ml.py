from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier
import file_utils as f_u
import predictions as pr 
import pandas as pd
import numpy as np

def generate_ml_model(csv_path, TYPES):
    df = pd.read_csv(csv_path, encoding="utf-8")
    df['text_license'] = df['text_license'].apply(f_u.normalize_text)

    # Crear features (porcentajes para cada tipo)
    for type_name, type_data in TYPES.items():
        df[f"score_{type_name}"] = df["text_license"].apply(
            lambda x: pr.create_strict_feature(x, type_data["MUST"], type_data["COULD"], 2, 1)
        )
    
    # Crear etiquetas binarias para cada tipo (one-hot encoding)
    for type_name in TYPES:
        df[f"label_{type_name}"] = (df["real_license_type"] == type_name).astype(int)
    
    # Features: scores para cada tipo
    X = df[[f"score_{t}" for t in TYPES]]
    
    # Target: múltiples etiquetas (one-hot)
    y = df[[f"label_{t}" for t in TYPES]]
    
    # Entrenar modelo multi-etiqueta
    model = MultiOutputClassifier(RandomForestClassifier())
    model.fit(X, y)
    
    return model
model=generate_ml_model("C:/Users/Usuario/Documents/GitHub/Tp_Principal_Labo/HealthFirst/backend/backend/utils/coherence_license_type_dataset.csv",pr.TYPE_CONFIG)

def predict_top_3_ml(certificate_text, model):
    """Versión definitiva que maneja listas y arrays"""
    # 1. Preprocesar texto
    normalized_text = f_u.normalize_text(certificate_text)
    
    # 2. Calcular features
    features = {
        f"score_{type_name}": pr.create_strict_feature(
            normalized_text,
            type_data["MUST"],
            type_data["COULD"],
            2, 1
        )
        for type_name, type_data in pr.TYPE_CONFIG.items()
    }
    
    # 3. Convertir a DataFrame
    X_input = pd.DataFrame([features])
    
    # 4. Obtener probabilidades (maneja listas y arrays)
    try:
        probas = model.predict_proba(X_input)
        # Convertir a array numpy si es lista
        probas = np.array(probas[0] if isinstance(probas, list) else probas)[0]
    except AttributeError:
        # Para modelos sin predict_proba
        decisions = model.decision_function(X_input)
        probas = np.exp(decisions) / np.sum(np.exp(decisions), axis=1)[0]
    
    # 5. Obtener clases (maneja diferentes formatos)
    try:
        classes = np.array(model.classes_)
    except:
        classes = np.array(list(pr.TYPE_CONFIG.keys()))
    
    # 6. Selección top 3 a prueba de errores
    probas = np.array(probas).flatten()  # Asegurar array 1D
    top_3_indices = np.argsort(probas)[-3:][::-1]
    
    # 7. Resultado garantizado
    return [
        (str(classes[i]), f"{100*probas[i]:.0f}%")
        for i in top_3_indices
    ]

texto="Hospital de Hemoterapia Buenos Aires Fecha: 15 de octubre de 2024 Certifico que el Sr. Luis Fernández, DNI 20.345.678, realizó una donación voluntaria de sangre en nuestra institución el día 14 de octubre de 2024. Según el artículo 82° del Convenio Colectivo de Trabajo de Comercio, el Sr. Fernández tiene derecho a un día de licencia laboral por esta donación. Firma: Dra. Verónica Pérez Matrícula: 7896543 Sello del Hospital: Hospital de Hemoterapia Buenos Aires - Tel. 4551-2345"
print(predict_top_3_ml(texto,model))