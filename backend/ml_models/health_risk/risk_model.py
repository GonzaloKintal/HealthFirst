import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler
from .risk_utils import generate_risk_dataframe, generate_employ_risk_dataframe
import joblib
from pathlib import Path
from functools import lru_cache
from ml_models.models import MLModel
from datetime import datetime

# Obtenemos la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Ruta donde se van a guardar los modelos
FILE_DIR = BASE_DIR / 'health_risk'
MODEL_PATH= FILE_DIR/'model.joblib'
SCALER_PATH=FILE_DIR/'standard_scaler.pkl'
DATASET_PATH=FILE_DIR/'dataset_risk.csv'

# @lru_cache(maxsize=1)

def get_models():
    """Obtener el modelo o crearlo si no existe"""
    if MODEL_PATH.exists() and SCALER_PATH.exists():
        return joblib.load(MODEL_PATH),joblib.load(SCALER_PATH)
    else:
        return train_and_save_model()

def train_and_save_model():
    """Entrenar el modelo"""
    model=LogisticRegression()
    df = pd.read_csv(DATASET_PATH)
    # Separamos datos en variables independientes (X) y objetivo (y)
    X = df[["age", "sickness_license_count", "accident_license_count",
            "in_high_risk_department"]]
    y = df["risk"]

    # Escalamos las características para poder trabajar con el modelo de regresión logística
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
    precision = accuracy_score(y_test, y_pred)*100
    print(f"Precisión del modelo: {precision:.1f}%")

    # Guardar el modelo y scaler
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    MLModel.objects.create(
        model_type= 'HEALTH_RISK',
        name= 'Modelo de prediccion de riesgo de salud',
        algorithm= 'LOGISTIC_REGRESSION',
        is_active= True,
        training_date = datetime.now(),
    )
    
    return model,scaler 
    

def predict_employ_risk(employ_id):
    """Devuelve el riesgo asociado a empleado consultado"""
    df=generate_employ_risk_dataframe(employ_id)
    model, scaler=get_models()
    X = df[["age", "sickness_license_count", "accident_license_count",
              "in_high_risk_department"]].copy()
    
    # Escalar características
    X_scaled = scaler.transform(X)

    # Hacer predicciones
    predictions = model.predict(X_scaled)
    df['risk']=predictions
    df['risk'] = np.where(predictions == 1, 'high risk', 'low risk')

    #Pasamos a JSON para que lo levante Front
    json_results= df.to_json(orient='records')

    print(json_results)
    return json_results

def predict_risk():
    """Devuelve el JSON asociado a la prediccion de riesgo de salud"""
    df=generate_risk_dataframe() #Obtenemos el dataframe con la informacion de la base de datos

    #Cargamos el scaler y el modelo de prediccion
    model, scaler = get_models()

    #Hacemos copia del dataframe original, atributos que sirven para la prediccion
    X = df[["age", "sickness_license_count", "accident_license_count",
              "in_high_risk_department"]].copy()
    

    # Escalar características
    X_scaled = scaler.transform(X)
    
    # Hacer predicciones
    predictions = model.predict(X_scaled)
    df['risk']=predictions
    df['risk'] = np.where(predictions == 1, 'high risk', 'low risk')

    #Pasamos a JSON para que lo levante Front
    json_results= df.to_json(orient='records')

    print(json_results)
    return json_results
