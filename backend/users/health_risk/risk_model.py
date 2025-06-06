import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler
from risk_utils import generate_risk_dataframe
import joblib
import os
from pathlib import Path
from functools import lru_cache

# Obtenemos la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Ruta donde se van a guardar los modelos
FILE_DIR = BASE_DIR / 'health_risk'
MODEL_PATH= FILE_DIR/'model.joblib'
SCALER_PATH=FILE_DIR/'standard_scaler.pkl'
RESULTS_PATH=FILE_DIR/'results_real_vs_prediction.csv'


# @lru_cache(maxsize=1)

def get_model():
    """Obtener el modelo o crearlo si no existe"""
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    else:
        model=LogisticRegression()
        joblib.dump(model,MODEL_PATH)
        return model

def training_model(df):
    """Entrenar el modelo"""
    model=get_model()

    # Separamos datos en variables independientes (X) y objetivo (y)
    X = df[["Edad", "Cant_licencias_enfermedad", "Cant_licencias_accidente",
            "Departamento_de_Riesgo"]]
    y = df["Riesgo"]

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
    
    print(f"Modelo guardado")
    print(f"Scaler guardado")

    #Guardamos los resultados de prueba (20% del dataset)
    pd.DataFrame({"Real": y_test, "Predicho": y_pred}).to_csv(RESULTS_PATH, index=False)
    print(f"Resultados guardados")

    return precision 

# Método para cargar el modelo entrenado y los transformadores
def load_trained_model():
    """Carga el modelo entrenado y los transformadores desde archivos"""
    try:

        if not os.path.exists(MODEL_PATH):
            print("Modelo no encontrado en:", MODEL_PATH)
            return None, None
            
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        return model, scaler

    except Exception as e:
        print(f"Error al cargar el modelo: {str(e)}")
        return None, None
    

# Método para predecir el riesgo
def predict_risk():
    """Devuelve el JSON asociado a la prediccion de riesgo de salud"""
    df=generate_risk_dataframe() #Obtenemos el dataframe con la informacion de la base de datos

    #Cargamos el scaler y el modelo de prediccion
    model, scaler = load_trained_model()

    #Hacemos copia del dataframe original, atributos que sirven para la prediccion
    X = df[["Edad", "Cant_licencias_enfermedad", "Cant_licencias_accidente",
              "Departamento_de_Riesgo"]].copy()
    
    # Escalar características
    X_scaled = scaler.transform(X)
    
    # Hacer predicciones
    predictions = model.predict(X_scaled)
    df['Riesgo']=predictions
    df['Riesgo'] = np.where(predictions == 1, 'Alto Riesgo', 'Bajo Riesgo')

    #Pasamos a JSON para que lo levante Front
    json_results= df.to_json(orient='records')

    print(json_results)
    return json_results

"""--------------------------------"""
#df_training=pd.read_csv("HealthFirst/backend/users/health_risk/dataset_risk.csv")
#training_model(df_training)
predict_risk()
