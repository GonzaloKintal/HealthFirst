import os
import numpy as np
import pandas as pd
import random
from pathlib import Path

# Obtiene la ruta base del proyecto (donde está manage.py)
BASE_DIR = Path(__file__).resolve().parent.parent

# Ruta donde se guardará el dataset
FILE_PATH = BASE_DIR / 'health_risk'


def assign_risk(edad, cant_cert_enfermedad, cant_cert_accidente, departamento):
    # Consideraciones de riesgo
    MAX_LIC_ENFERMEDAD = 3   
    MAX_LIC_ACCIDENTE = 2    
    EDAD_REFERENCIA = 60
    
    # Pesos
    peso_edad = 0.3
    peso_enfermedad = 0.4
    peso_accidente = 0.3
    
    riesgo_departamento = {
        'Producción': 1.2,
        'Logística': 1.1,
        'Administración': 1.0,
        'TI': 1.0,
        'Ventas': 1.0
    }
    
    # Normalizamos los valores
    edad_norm = min(edad / EDAD_REFERENCIA, 1)  
    enfermedad_norm = min(cant_cert_enfermedad / MAX_LIC_ENFERMEDAD, 1) 
    accidente_norm = min(cant_cert_accidente / MAX_LIC_ACCIDENTE, 1)  
    
    # Factor del departamento
    factor_dep = riesgo_departamento.get(departamento, 1.0)
    
    # Calculamos score (0-10)
    score = (
        (edad_norm * peso_edad) + 
        (enfermedad_norm * peso_enfermedad) + 
        (accidente_norm * peso_accidente)
    ) * factor_dep * 10
    
    return "Alto Riesgo" if score > 5 else "Bajo Riesgo"


def generate_dataset(nro_empleados=500, seed=None):
    # Configuración de semilla aleatoria
    if seed is not None:
        np.random.seed(seed)
    else:
        np.random.seed(42)  # Semilla por defecto

    # Generación de datos aleatorios
    edad = np.random.randint(18, 71, nro_empleados)
    cant_cert_enfermedad = np.random.randint(0, 4, nro_empleados)  # 0-3
    cant_cert_accidente = np.random.randint(0, 3, nro_empleados)    # 0-2
    departamento = np.random.choice(
        ['Producción', 'Logística', 'Administración', 'TI', 'Ventas'], 
        nro_empleados
    )

    # Calculamos el riesgo para cada empleado
    riesgo = [
        assign_risk(ed, enf, acc, dep) 
        for ed, enf, acc, dep in zip(
            edad, cant_cert_enfermedad, cant_cert_accidente, departamento
        )
    ]

    # Creamos el DataFrame
    df = pd.DataFrame({
        'ID': range(1, nro_empleados + 1),
        'Edad': edad,
        'Cant_licencias_enfermedad': cant_cert_enfermedad,
        'Cant_licencias_accidente': cant_cert_accidente,
        'Departamento': departamento,   
        'Riesgo': riesgo
    })

    # Convertimos a valores binarios
    df["Riesgo"] = df["Riesgo"].map({"Alto Riesgo": 1, "Bajo Riesgo": 0})

    # Guardamos el archivo
    file_name = 'dataset_risk.csv'
    
    # Guardamos el CSV
    full_path=os.path.join(FILE_PATH,file_name)
    # Crear directorio si no existe (¡importante!)
    os.makedirs(FILE_PATH, exist_ok=True)
    df.to_csv(str(full_path), index=False)
    

    print(f"Dataset generado")
    return df

if __name__ == "__main__":
    dataset = generate_dataset()
"""print("\nPrimeras 5 filas del dataset:")
    print(dataset.head())"""