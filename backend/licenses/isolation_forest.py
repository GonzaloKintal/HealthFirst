import sys
import os
from pathlib import Path
import pandas as pd
from sklearn.ensemble import IsolationForest

import django
import sys
from django.db.models import Sum,Count
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.local')
django.setup()

from licenses.models import License
from licenses.utils.file_utils import (
    base64_to_text,
    is_pdf_image,
    normalize_text,
    date_in_range,
    search_in_pdf_text,
)


def create_dataFrame():
    #agrupo licencias por empleado
    licencias = License.objects.values('user_id').annotate(
        total_days_requested=Sum('required_days'),
        num_requests=Count('license_id')
    )

    #convertir a DataFrame
    df = pd.DataFrame(list(licencias))

    # Calcular promedio de días por solicitud
    df['prom_days_request'] = df['total_days_requested'] / df['num_requests']


    print(df)
    return df

def create_dataframe_supervisor():
    qs = License.objects.filter(evaluator__isnull=False).values('evaluator_id').annotate(
    total_requests=Count('id'),
    approved_requests=Count('id', filter=Q(status__name='approved')), #cant solicitudes aprobadas
    rejected_requests=Count('id', filter=Q(status__name='rejected')) #cant solicitudes rechazadas
    )
    
    df = pd.DataFrame(list(qs))
    df['approval_rate'] = df['approved_requests'] / df['total_requests'] #porcentaje de aprobados
    df['rejection_rate'] = df['rejected_requests'] / df['total_requests'] #porcentaje de rechazados
    print(df)
    return df

def create_model_supervisor(data):
    features = data[['total_requests', 'approved_requests', 'rejected_requests', 'approval_rate', 'rejection_rate']]

     # Entrenamiento del modelo Isolation Forest
    model = IsolationForest(n_estimators=100, contamination=0.2, random_state=42)
    model.fit(features)

    # Guardar el modelo en un archivo, ESTO ES LO CORRECTO
    #joblib.dump(model, 'isolation_forest_sup_model.pkl') 

    return model # NO deberia retornarlo, pero por ahora para pruebas lo dejo así
def anomalies_supervisores(data,model): #por ahora recibe el modelo, pero NO deberia
    print("ANOMALIAS PARA SUPERVISORES")

    #Cargo el modelo previamente guardado #ESTO ES LO CORRECTO
    #model = joblib.load('isolation_forest_sup_model.pkl')

    features = data[['total_requests', 'approved_requests', 'rejected_requests', 'approval_rate', 'rejection_rate']]


    data['anomaly_score'] = model.decision_function(features)
    data['is_anomaly'] = model.predict(features)
    data['is_anomaly'] = data['is_anomaly'].map({1: 0, -1: 1})  # 1 = Anómalo, 0 = Normal

    #muestro los resultados
    print(data[['evaluator_id', 'total_requests', 'approved_requests', 'rejected_requests', 'approval_rate', 'rejection_rate', 'anomaly_score', 'is_anomaly']])


def data_csv_sup():#para pruebas
    data = pd.DataFrame({
        'evaluator_id': range(1, 11),
        'total_requests': [20, 15, 10, 8, 30, 12, 7, 25, 18, 5],  # Ej: supervisor 10 podría ser anómalo
        'approved_requests': [18, 12, 9, 8, 28, 10, 6, 10, 17, 0],
        'rejected_requests': [2, 3, 1, 0, 2, 2, 1, 15, 1, 5]
    })

    data['approval_rate'] = data['approved_requests'] / data['total_requests']
    data['rejection_rate'] = data['rejected_requests'] / data['total_requests']
    print(data)
    return data