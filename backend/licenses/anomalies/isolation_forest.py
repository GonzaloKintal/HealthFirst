from datetime import date
import sys
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
from django.db.models import Min, Max

import django
from django.db.models import Sum,Count,Q
#sys.path.append(os.path.dirname(os.path.dirname(__file__)))
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.local')
django.setup()

from licenses.models import License

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'isolation_forest_sup_model.pkl')

import pandas as pd

pd.set_option("display.max_columns", None)  # Mostrar todas las columnas
pd.set_option("display.max_rows", None)     # Mostrar todas las filas
pd.set_option("display.width", 0)           # Autoajuste al ancho de consola

def create_model_supervisor(path_csv): # le paso el csv para el entreamiento
    data= pd.read_csv(path_csv)
    features = data[['total_requests', 'approved_requests', 'rejected_requests', 'approval_rate', 'rejection_rate']]

     # Entrenamiento del modelo Isolation Forest
    model = IsolationForest(n_estimators=100, contamination=0.2, random_state=42)
    model.fit(features)

    # Guardar el modelo en un archivo, ESTO ES LO CORRECTO
    joblib.dump(model, MODEL_PATH)

    return model # NO deberia retornarlo, pero por ahora para pruebas lo dejo así


def anomalies_supervisors(data): #recibe un dataframe
    #print("\n ----------------------ANOMALIAS PARA SUPERVISORES")

    #Cargo el modelo previamente guardado
    model = joblib.load(MODEL_PATH)
    #data= pd.read_csv(path_csv)
    features = data[['total_requests', 'approved_requests', 'rejected_requests', 'approval_rate', 'rejection_rate']]


    data['anomaly_score'] = model.decision_function(features)
    data['is_anomaly'] = model.predict(features)
    data['is_anomaly'] = data['is_anomaly'].map({1: 0, -1: 1})  # 1 = Anómalo, 0 = Normal
    data['approval_rate'] = (data['approval_rate'])
    data['rejection_rate'] = (data['rejection_rate'])

    return(data)



def create_dataframe_supervisor(start_date=None, end_date=None): # esto para lo que pide el admin
    qs = License.objects.filter(evaluator__isnull=False)

    if start_date and end_date:
        qs = qs.filter(status__evaluation_date__range=(start_date, end_date))

    qs = qs.values('evaluator_id').annotate(
        total_requests=Count('license_id'),
        approved_requests=Count('license_id', filter=Q(status__name='approved')),
        rejected_requests=Count('license_id', filter=Q(status__name='rejected'))
    )

    df = pd.DataFrame(list(qs))
    #print(df.head())
    #print(df.dtypes)

    if df.empty:
        return df

    df['approval_rate'] = 0.0
    df['rejection_rate'] = 0.0

    df.loc[df['total_requests'] > 0, 'approval_rate'] = (
        df.loc[df['total_requests'] > 0, 'approved_requests'] / df.loc[df['total_requests'] > 0, 'total_requests']
    )

    df.loc[df['total_requests'] > 0, 'rejection_rate'] = (
        df.loc[df['total_requests'] > 0, 'rejected_requests'] / df.loc[df['total_requests'] > 0, 'total_requests']
    )
    #print(df)
    return df



def generate_supervisors_csv(path_csv='supervisors_data_1000.csv', n=1000, semilla=42):
    np.random.seed(semilla)
    
    evaluator_id = np.arange(1, n+1)
    total_requests = np.random.randint(5, 51, size=n)
    
    approval_rate_base = np.random.uniform(0.7, 0.95, size=n)
    anomaly_indices = np.random.choice(n, size=int(n*0.05), replace=False)
    approval_rate_base[anomaly_indices] = np.random.uniform(0, 0.4, size=len(anomaly_indices))
    
    approved_requests = (approval_rate_base * total_requests).round().astype(int)
    rejected_requests = total_requests - approved_requests
    
    df = pd.DataFrame({
        'evaluator_id': evaluator_id,
        'total_requests': total_requests,
        'approved_requests': approved_requests,
        'rejected_requests': rejected_requests,
    })
    
    df['approval_rate'] = df['approved_requests'] / df['total_requests']
    df['rejection_rate'] = df['rejected_requests'] / df['total_requests']
    
    df.to_csv(path_csv, index=False)
    return df

def get_supervisor_anomalies(start_date=None, end_date=None): #FUNCION PRINCIPAL QUE SE USARA EN EL FRONT
    df = create_dataframe_supervisor(start_date, end_date)
    if df.empty:
        cols = ['evaluator_id', 'total_requests', 'approved_requests', 'rejected_requests', 'approval_rate', 'rejection_rate']
        return pd.DataFrame(columns=cols)
    dataframe =  anomalies_supervisors(df)
    
    global_approval_rate = dataframe['approval_rate'].mean()
    global_rejection_rate = dataframe['rejection_rate'].mean()
    total_requests_sum = dataframe['total_requests'].sum()

    dataframe['approval_rate_diff'] = dataframe['approval_rate'] - global_approval_rate
    dataframe['rejection_rate_diff'] = dataframe['rejection_rate'] - global_rejection_rate
    dataframe['total_requests_percent'] = dataframe['total_requests'] / total_requests_sum 

    dataframe['approval_rate'] = (dataframe['approval_rate']*100).map("{:.2f}%".format)
    dataframe['rejection_rate'] = (dataframe['rejection_rate']*100).map("{:.2f}%".format)
    dataframe['approval_rate_diff'] = (dataframe['approval_rate_diff']*100).map("{:+.2f}%".format)
    dataframe['rejection_rate_diff'] = (dataframe['rejection_rate_diff']*100).map("{:+.2f}%".format)
    dataframe['total_requests_percent'] = (dataframe['total_requests_percent']*100).map("{:.2f}%".format)

    return dataframe

print(get_supervisor_anomalies())





#---------------------------------------------------------------------------------------------------------------
#falta evaluar fechas de ingreso, es mas anomalo teniendo en cuenta la fecha en la que el supervisor comenzó a trabajr
def dataframe_pruebas(): # para pruebas
    data = pd.DataFrame({
    'evaluator_id': [6,7, 8, 9, 10, 11, 12,13],
    'total_requests': [0,40, 28, 35, 50, 20, 30,100],
    'approved_requests': [0,35, 24, 18, 48, 3, 10,50],
    'rejected_requests': [0,5, 4, 17, 2, 17, 20,50],
    })

    # Calcular tasas
    data['approval_rate'] = data.apply(
    lambda row: row['approved_requests'] / row['total_requests'] if row['total_requests'] > 0 else 0,
    axis=1
    )

    data['rejection_rate'] = data.apply(
        lambda row: row['rejected_requests'] / row['total_requests'] if row['total_requests'] > 0 else 0,
        axis=1
    )
    return data



def pruebas():
    dataframe= anomalies_supervisors(dataframe_pruebas())
    top_anomalies = dataframe.sort_values(by='anomaly_score').head(2).reset_index(drop=True)
    return top_anomalies
#print(pruebas()) # para pruebas


#--proximamente para anomalias en empleados
def create_dataFrame_empleados():
    #agrupo licencias por empleado
    licencias = License.objects.values('user_id').annotate(
        total_days_requested=Sum('required_days'),
        num_requests=Count('license_id')
    )

    #convertir a DataFrame
    df = pd.DataFrame(list(licencias))

    # Calcular promedio de días por solicitud
    df['prom_days_request'] = df['total_days_requested'] / df['num_requests']


    #print(df)
    return df
