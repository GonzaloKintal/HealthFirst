import pandas as pd
import re
import joblib
import file_utils as f_u
import predictions as pr

import os

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

def generate_coherence_model(cvs_path, TYPES):
    """Genera el modelo de coherencia tomando el dataset.csv y el diccionario de los tipos de licencia"""
    # Cargar el dataset básico a un dataframe
    df = pd.read_csv(cvs_path, encoding="utf-8")
    df['text_license'] = df['text_license'].apply(f_u.normalize_text)

    # Generar los atributos del modelo según el diccionario
    for type_name, type_data in TYPES.items():
        df[f"justify_{type_name}"] = df["text_license"].apply(
            lambda x: pr.create_strict_feature(
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

    # 4. Evaluar el modelo con el conjunto de TEST
    y_pred = model.predict(X_test)

    # Reporte de clasificación (¡ESTE ES EL JUICIO AL MODELO!) 
    print("Viene el reporte:") 
    print(classification_report(y_test, y_pred))

    return model, df 


    
print(generate_coherence_model("HealthFirst/backend/backend/utils/coherence_license_type_dataset.csv",pr.pruebaRapida()))
