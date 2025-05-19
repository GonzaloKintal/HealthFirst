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



def anomalies(data):
    # 1. Obtener datos desde el ORM
    #qs = License.objects.values('user_id').annotate(
    #    total_days_requested=Sum('required_days'),
    #    num_requests=Count('license_id')
    #)

    # 2. Crear DataFrame
    #data = pd.DataFrame(list(qs))

    #if data.empty:
    #    print("No hay datos para analizar.")
    #    return

    # 3. Calcular promedio
    #data['prom_days_request'] = data['total_days_requested'] / data['num_requests']

    features = data[['total_days_requested', 'num_requests', 'prom_days_request']]

    # Entrenamiento del modelo Isolation Forest
    model = IsolationForest(n_estimators=100, contamination=0.2, random_state=42)
    model.fit(features)

    data['anomaly_score'] = model.decision_function(features)
    data['is_anomaly'] = model.predict(features)

    # Convertir la predicción a etiquetas comprensibles
    data['is_anomaly'] = data['is_anomaly'].map({1: 0, -1: 1})  # 1 = Anómalo, 0 = Normal

    # Mostrar resultados
    print(data[['user_id', 'total_days_requested', 'num_requests', 'prom_days_request', 'anomaly_score', 'is_anomaly']])

#data=create_dataFrame() cuando tenga mas info en el dataset
data = pd.DataFrame({
    'user_id': range(1, 11),
    'total_days_requested': [5, 6, 15, 5, 6, 7, 5, 4, 6, 30],  # Usuario 10 es anómalo
    'num_requests': [1, 1, 15, 1, 1, 1, 1, 1, 1, 2]
})
data['prom_days_request'] = data['total_days_requested'] / data['num_requests']
anomalies(data)