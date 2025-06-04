import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from django.conf import settings
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os
from pathlib import Path
from functools import lru_cache

# Obtiene la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Ruta donde se guardarán los modelos
FILE_DIR = BASE_DIR / 'health_risk'
MODEL_PATH= FILE_DIR/'model.joblib'
ENCODER_PATH=FILE_DIR/'label_encoder.pkl'
SCALER_PATH=FILE_DIR/'standard_scaler.pkl'
RESULTS_PATH=FILE_DIR/'results.csv'

# Método para obtener el modelo o crearlo si no existe
# @lru_cache(maxsize=1)

def get_model():
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    else:
        model=LogisticRegression()
        joblib.dump(model,MODEL_PATH)

# Método para entrenar el modelo
def training_model(df):
    model=get_model()

    # Separamos datos en variables independientes (X) y objetivo (y)
    X = df[["Edad", "Cant_licencias_enfermedad", "Cant_licencias_accidente",
            "Departamento_de_Riesgo"]]
    y = df["Riesgo"]

    # Escalamos las características
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Dividimos en conjunto de entrenamiento y prueba (80%-20%)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    model.fit(X_train, y_train)
    # Hacemos las predicciones
    y_pred = model.predict(X_test)

    # Evaluamos el modelo
    precision = accuracy_score(y_test, y_pred)
    print(f"Precisión del modelo: {precision:.2f}")

    # Guardar el modelo, encoder y scaler
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoder,ENCODER_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    print(f"Modelo guardado")
    print(f"Encoder guardado")
    print(f"Scaler guardado")

    # Opcional: Guardar resultados de prueba
    pd.DataFrame({"Real": y_test, "Predicho": y_pred}).to_csv(RESULTS_PATH, index=False)
    print(f"Resultados guardados")

    return precision * 100

# Método para cargar el modelo entrenado y los transformadores
def load_trained_model():
    """Carga el modelo entrenado y los transformadores desde archivos"""
    try:

        if not os.path.exists(MODEL_PATH):
            print("Modelo no encontrado en:", MODEL_PATH)
            return None, None, None
            
        model = joblib.load(MODEL_PATH)
        encoder = joblib.load(ENCODER_PATH)
        scaler = joblib.load(SCALER_PATH)
        
        return model, encoder, scaler
    except Exception as e:
        print(f"Error al cargar el modelo: {str(e)}")
        return None, None, None

# Método para predecir el riesgo
def predict_risk(df):
    
    #Realiza predicciones con el modelo entrenado
    model, encoder, scaler = load_trained_model()

    # copia del dataframe original para obtener la prediccion
    X = df[["Edad", "Cant_licencias_enfermedad", "Cant_licencias_accidente",
              "Departamento_de_Riesgo"]].copy()
    
    # Escalar características
    X_scaled = scaler.transform(X)
    
    # Hacer predicciones
    predictions = model.predict(X_scaled)
    
    return predictions
