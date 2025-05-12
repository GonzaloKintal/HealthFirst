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
    # Cargar el dataset basico a un dataframe
    df = pd.read_csv(cvs_path, encoding="utf-8")
    df['text_license'] = df['text_license'].apply(f_u.normalize_text)

    # Generar los atributos del modelo segun el diccionario
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
    model = LogisticRegression(solver="lbfgs", C=0.1, max_iter=1000)
    model.fit(X_train,y_train)
    joblib.dump(model,"prediction_type_model.pkl")
    #Predecir etiquetas para el test
    y_pred=model.predict(X_test)
    #Mostramos el reporte de clasificacion
    print(classification_report(y_test,y_pred))
    #Matriz de confusion para ver que clases se confunden
    #print(confusion_matrix(y_test, y_pred, labels=model.classes_))

        

print(generate_coherence_model("HealthFirst/backend/backend/utils/coherence_license_type_dataset.csv",pr.pruebaRapida()))

"""
    

    #Ver la precision del modelo

    
"""