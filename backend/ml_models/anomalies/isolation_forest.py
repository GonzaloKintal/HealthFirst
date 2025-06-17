from datetime import date, datetime, timedelta
import sys
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

import django
from django.db.models import Sum,Count,OuterRef,Subquery ,IntegerField,Value
from django.db.models.functions import Coalesce


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.local')
django.setup()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#MODEL_PATH_SUP = os.path.join(BASE_DIR, 'isolation_forest_sup_model_v3.pkl')
MODEL_PATH_SUP = os.path.join(BASE_DIR, 'isolation_forest_sup_model_v4.pkl')

#MODEL_PATH_EMP = os.path.join(BASE_DIR, 'isolation_forest_emp_model_v2.pkl')
#MODEL_PATH_EMP = os.path.join(BASE_DIR, 'isolation_forest_emp_model_v3.pkl')
MODEL_PATH_EMP = os.path.join(BASE_DIR, 'isolation_forest_emp_model_v4.pkl')

pd.set_option("display.max_columns", None)  # Mostrar todas las columnas
pd.set_option("display.max_rows", None)     # Mostrar todas las filas
pd.set_option("display.width", 0)           # Autoajuste al ancho de consola

from licenses.models import License
from users.models import HealthFirstUser
import pandas as pd


#ANOMALIAS SOBRE SUPERVISORES------------------------------------------------------------------------------------
def create_model_supervisor(path_csv): # le paso el csv para el entreamiento
    data= pd.read_csv(path_csv)
    features = data[['total_requests', 'approved_requests', 'rejected_requests','seniority_days']].copy()

     # Entrenamiento del modelo Isolation Forest
    model = IsolationForest(
        n_estimators=200,
        contamination=0.1,
        max_samples='auto',
        max_features=0.8,
        random_state=42,
    )
    model.fit(features)

    # Guardar el modelo en un archivo, ESTO ES LO CORRECTO
    #joblib.dump(model, MODEL_PATH_SUP)
    joblib.dump(model,MODEL_PATH_SUP)

    return model # NO deberia retornarlo, pero por ahora para pruebas lo dejo así


def anomalies_supervisors(data): #recibe un dataframe
    #Cargo el modelo previamente guardado
    model = joblib.load(MODEL_PATH_SUP)
    #data= pd.read_csv(path_csv)
    features = data[['total_requests', 'approved_requests', 'rejected_requests', 'seniority_days']]


    data['anomaly_score'] = model.decision_function(features)
    data['is_anomaly'] = model.predict(features)
    data['is_anomaly'] = data['is_anomaly'].map({1: 0, -1: 1})  # 1 = Anómalo, 0 = Normal


    return(data)



def create_dataframe_supervisor(start_date=None, end_date=None): # esto para lo que pide el admin
    supervisors = HealthFirstUser.objects.filter(role__name='supervisor')
    
    license_base = License.objects.filter(evaluator=OuterRef('pk'))
    if start_date and end_date:
        license_base = license_base.filter(status__evaluation_date__range=(start_date, end_date))
    
    total_requests = license_base.order_by().values('evaluator').annotate(c=Count('pk')).values('c')[:1]
    approved_requests = license_base.filter(status__name='approved').order_by().values('evaluator').annotate(c=Count('pk')).values('c')[:1]
    rejected_requests = license_base.filter(status__name='rejected').order_by().values('evaluator').annotate(c=Count('pk')).values('c')[:1]
    
    supervisors = supervisors.annotate(
        total_requests=Coalesce(Subquery(total_requests), Value(0, output_field=IntegerField())),
        approved_requests=Coalesce(Subquery(approved_requests), Value(0, output_field=IntegerField())),
        rejected_requests=Coalesce(Subquery(rejected_requests), Value(0, output_field=IntegerField()))
    )
    # Convertir a DataFrame
    df = pd.DataFrame(list(supervisors.values(
        'id', 'total_requests', 'approved_requests', 'rejected_requests', 'employment_start_date',
    )))
    df = df.rename(columns={'id': 'evaluator_id'})

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

    today = date.today()

    df['seniority_days'] = df['employment_start_date'].apply(lambda d: (today - d).days if d else 0)
    df.drop(columns=['employment_start_date'], inplace=True)
    #print(df)
    return df



def generate_supervisors_csv(path_csv='supervisors_data_1000.csv', n=1000, semilla=42):
    np.random.seed(semilla)

    pct_new_normal = 0.05       # Nuevos con 0 evaluaciones (normales)
    pct_old_zero_anomaly = 0.05 # Viejos con 0 evaluaciones (potencialmente anómalos)
    n_new = int(n * pct_new_normal)
    n_old_zero = int(n * pct_old_zero_anomaly)
    n_regular = n - n_new - n_old_zero

    total_requests = np.random.randint(5, 51, size=n_regular)
    approval_rate = np.random.uniform(0.7, 0.95, size=n_regular)
    approved_requests = (approval_rate * total_requests).astype(int)
    rejected_requests = total_requests - approved_requests
    seniority_days = np.random.randint(180, 2000, size=n_regular)

    df_regular = pd.DataFrame({
        'evaluator_id': range(1, n_regular + 1),
        'total_requests': total_requests,
        'approved_requests': approved_requests,
        'rejected_requests': rejected_requests,
        'seniority_days': seniority_days,
    })

    df_new = pd.DataFrame({
        'evaluator_id': range(n_regular + 1, n_regular + n_new + 1),
        'total_requests': 0,
        'approved_requests': 0,
        'rejected_requests': 0,
        'seniority_days': np.random.randint(0, 366, size=n_new),
    })

    df_old_zero = pd.DataFrame({
        'evaluator_id': range(n_regular + n_new + 1, n + 1),
        'total_requests': 0,
        'approved_requests': 0,
        'rejected_requests': 0,
        'seniority_days': np.random.randint(366, 2000, size=n_old_zero),
    })

    df = pd.concat([df_regular, df_new, df_old_zero], ignore_index=True)

    df['approval_rate'] = df.apply(
        lambda row: row['approved_requests'] / row['total_requests'] if row['total_requests'] > 0 else 0, axis=1)
    df['rejection_rate'] = df.apply(
        lambda row: row['rejected_requests'] / row['total_requests'] if row['total_requests'] > 0 else 0, axis=1)

    df.to_csv(path_csv, index=False)
    return df

def get_supervisor_anomalies(start_date=None, end_date=None): #FUNCION PRINCIPAL QUE SE USARA EN EL FRONT
    df = create_dataframe_supervisor(start_date, end_date)
    if df.empty:
        cols = ['evaluator_id','evaluator_name','department', 'total_requests', 'approved_requests', 'rejected_requests', 'approval_rate', 'rejection_rate','seniority_days']
        return pd.DataFrame(columns=cols)
    dataframe =  anomalies_supervisors(df)
    
    names = []
    departments = []

    for evaluator_id in dataframe['evaluator_id']:
        try:
            user = HealthFirstUser.objects.select_related('department').get(id=evaluator_id)
            full_name = f"{user.first_name} {user.last_name}"
            dept_name = user.department.name if user.department else "Sin departamento"
        except HealthFirstUser.DoesNotExist:
            full_name = "Desconocido"
            dept_name = "Desconocido"

        names.append(full_name)
        departments.append(dept_name)

    dataframe['evaluator_name'] = names
    dataframe['department'] = departments

    global_approval_rate = dataframe['approval_rate'].mean()
    global_rejection_rate = dataframe['rejection_rate'].mean()
    total_requests_sum = dataframe['total_requests'].sum()

    dataframe['approval_rate_diff'] = dataframe['approval_rate'] - global_approval_rate #NUEVA INFO
    dataframe['rejection_rate_diff'] = dataframe['rejection_rate'] - global_rejection_rate#NUEVA INFO
    dataframe['total_requests_percent'] = dataframe['total_requests'] / total_requests_sum #NUEVA INFO

    dataframe['approval_rate'] = (dataframe['approval_rate']*100).map("{:.2f}%".format)
    dataframe['rejection_rate'] = (dataframe['rejection_rate']*100).map("{:.2f}%".format)
    dataframe['approval_rate_diff'] = (dataframe['approval_rate_diff']*100).map("{:+.2f}%".format) #NUEVA INFO
    dataframe['rejection_rate_diff'] = (dataframe['rejection_rate_diff']*100).map("{:+.2f}%".format) #NUEVA INFO
    dataframe['total_requests_percent'] = (dataframe['total_requests_percent']*100).map("{:.2f}%".format)#NUEVA INFO
    #print(dataframe)
    dataframe = dataframe.drop(columns=['seniority_days'])

    columnas_ordenadas = ['evaluator_id','evaluator_name', 'department'] + [col for col in dataframe.columns if col not in ['evaluator_name', 'department']]
    return dataframe[columnas_ordenadas]

#ANOMALIAS SOBRE EMPLEADOS(solicitudes de licencias)------------------------------------------------------------------------------------
def generate_employees_csv(path_csv='employees_data_1000.csv', n=1000, semilla=42):
    np.random.seed(semilla)
    
    employee_id = np.arange(1, n+1)
    total_requests = np.random.randint(5, 51, size=n)
    required_days = np.random.randint(10, 201, size=n)
    today = datetime.today()
    start_dates = [today - timedelta(days=int(np.random.uniform(30, 3650))) for _ in range(n)]
    seniority_days = [(today - d).days for d in start_dates]
    required_days_rate = required_days / total_requests
    days_per_year = required_days / (np.array(seniority_days) / 365 + 1e-3)


    mon_fri_requests = np.random.randint(0, 11, size=n)

    #anomalías en el 5%
    num_anomalies = int(n * 0.05)
    anomaly_indices = np.random.choice(n, size=num_anomalies, replace=False)

    for idx in anomaly_indices:
        if np.random.rand() < 0.5:
            required_days_rate[idx] *= np.random.uniform(2, 4)
            required_days[idx] = int(required_days_rate[idx] * total_requests[idx])
        else:
            days_per_year[idx] *= np.random.uniform(2, 4)
            required_days[idx] = int(days_per_year[idx] * (seniority_days[idx] / 365))

        #mon_fri_requests para anomalías (más del 60% de los días)
        mon_fri_requests[idx] = max(mon_fri_requests[idx], int(required_days[idx] * 0.6))

    required_days = np.clip(required_days, 1, None)
    required_days_rate = required_days / total_requests
    days_per_year = required_days / (np.array(seniority_days) / 365 + 1e-3)

    df = pd.DataFrame({
        'empleado_id': employee_id,
        'total_requests': total_requests,
        'required_days': required_days,
        'required_days_rate': required_days_rate,
        'seniority_days': seniority_days,
        'days_per_year': days_per_year,
        'mon_fri_requests': mon_fri_requests
    })

    df.to_csv(path_csv, index=False)
    return df

def create_model_empleados(path_csv): # le paso el csv para el entreamiento
    data= pd.read_csv(path_csv)
    features = data[['total_requests', 'required_days', 'required_days_rate','seniority_days','days_per_year','mon_fri_requests']]

    #entrenamiento del modelo Isolation Forest
    model = IsolationForest(
        n_estimators=200,
        contamination=0.1,
        max_samples="auto",
        max_features=0.8,
        random_state=42,
    )
    model.fit(features)

    #se guardan el modelo en un archivo
    joblib.dump(model, MODEL_PATH_EMP)

def create_dataFrame_empleados(start_date=None, end_date=None):
    employees = HealthFirstUser.objects.filter(role__name='employee', is_deleted=False)

    df = pd.DataFrame(list(employees.values('id', 'employment_start_date')))
    df.rename(columns={'id': 'employee_id'}, inplace=True)

    if df.empty:
        return df

    licenses = License.objects.all()
    if start_date and end_date:
        licenses = licenses.filter(request_date__range=(start_date, end_date))

    lic_data = licenses.values('user_id').annotate(
        total_requests=Count('license_id'),
        required_days=Sum('required_days')
    )
    lic_df = pd.DataFrame(list(lic_data))

    if not lic_df.empty and 'user_id' in lic_df.columns:
        lic_df.rename(columns={'user_id': 'employee_id'}, inplace=True)
    else:
        #lic_df está vacío o no contiene 'user_id'")
        lic_df = pd.DataFrame(columns=['employee_id', 'total_requests', 'required_days'])

    df = df.merge(lic_df, on='employee_id', how='left')
    df['total_requests'] = df['total_requests'].fillna(0).astype(int)
    df['required_days'] = df['required_days'].fillna(0).astype(int)

    today = date.today()
    df['required_days_rate'] = df.apply(
        lambda row: row['required_days'] / row['total_requests'] if row['total_requests'] > 0 else 0, axis=1
    )
    df['seniority_days'] = df['employment_start_date'].apply(
        lambda d: (today - d).days if d else 0
    )
    df['days_per_year'] = df.apply(
        lambda row: row['required_days'] / (row['seniority_days'] / 365) if row['seniority_days'] > 0 else 0, axis=1
    )

    df.drop(columns=['employment_start_date'], inplace=True)

    mon_fri_df = calculate_mon_fri(start_date, end_date)
    df = df.merge(mon_fri_df, on='employee_id', how='left')
    df['mon_fri_requests'] = df['mon_fri_requests'].fillna(0).astype(int)
    
    return df
def calculate_mon_fri(start_date=None, end_date=None):
    licenses = License.objects.all()
    if start_date and end_date:
        licenses = licenses.filter(request_date__range=(start_date, end_date))

    # Obtener usuario y fecha de inicio de la licencia
    license_day_data = licenses.values('user_id', 'start_date')
    day_df = pd.DataFrame(list(license_day_data))

    if day_df.empty:
        return pd.DataFrame(columns=['employee_id', 'mon_fri_requests'])

    # Asegurar tipo datetime
    day_df['start_date'] = pd.to_datetime(day_df['start_date'], errors='coerce')

    # Día de la semana: 0 = lunes, 4 = viernes
    day_df['weekday'] = day_df['start_date'].dt.weekday
    mon_fri_df = day_df[day_df['weekday'].isin([0, 4])]

    # Contar por usuario
    weekday_counts = mon_fri_df.groupby('user_id').size().reset_index(name='mon_fri_requests')
    weekday_counts.rename(columns={'user_id': 'employee_id'}, inplace=True)

    return weekday_counts
    
def anomalies_employees(data): #recibe un dataframe
    #Cargo el modelo previamente guardado
    model = joblib.load(MODEL_PATH_EMP)
    features = data[['total_requests', 'required_days', 'required_days_rate','seniority_days','days_per_year','mon_fri_requests']]


    data['anomaly_score'] = model.decision_function(features)
    data['is_anomaly'] = model.predict(features)
    data['is_anomaly'] = data['is_anomaly'].map({1: 0, -1: 1})  # 1 = Anómalo, 0 = Normal

    return(data)

def get_employee_anomalies(start_date=None, end_date=None): #FUNCION PRINCIPAL QUE SE USARA EN EL FRONT
    df = create_dataFrame_empleados(start_date, end_date)
    if df.empty:
        cols = ['employee_id','employee_name', 'department','total_requests', 'required_days', 'required_days_rate','seniority_days','days_per_year','mon_fri_requests']
        return pd.DataFrame(columns=cols)
    dataframe =  anomalies_employees(df)

    names = []
    departments = []

    for employee_id in dataframe['employee_id']:
        try:
            user = HealthFirstUser.objects.select_related('department').get(id=employee_id)
            full_name = f"{user.first_name} {user.last_name}"
            dept_name = user.department.name if user.department else "Sin departamento"
        except HealthFirstUser.DoesNotExist:
            full_name = "Desconocido"
            dept_name = "Desconocido"

        names.append(full_name)
        departments.append(dept_name)

    dataframe['employee_name'] = names
    dataframe['department'] = departments

    global_required_days = dataframe['required_days'].mean()
    global_total_requests = dataframe['total_requests'].mean()
    global_days_per_year = dataframe['days_per_year'].mean()
    global_required_days_rate = dataframe['required_days_rate'].mean()
    total_required_days_sum = dataframe['required_days'].sum()

    dataframe['required_days_diff'] = dataframe['required_days'] - global_required_days
    dataframe['total_requests_diff'] = dataframe['total_requests'] - global_total_requests
    dataframe['days_per_year_diff'] = dataframe['days_per_year'] - global_days_per_year
    dataframe['required_days_rate_diff'] = dataframe['required_days_rate'] - global_required_days_rate

    dataframe['required_days_percent'] = dataframe['required_days'] / total_required_days_sum

    dataframe['required_days_diff'] = dataframe['required_days_diff'].map("{:+.2f}".format)
    dataframe['total_requests_diff'] = dataframe['total_requests_diff'].map("{:+.2f}".format)
    dataframe['days_per_year_diff'] = dataframe['days_per_year_diff'].map("{:+.2f}".format)
    dataframe['required_days_rate_diff'] = dataframe['required_days_rate_diff'].map("{:+.2f}".format)
    dataframe['required_days_percent'] = (dataframe['required_days_percent'] * 100).map("{:.2f}%".format)

    columnas_ordenadas = ['employee_id','employee_name', 'department'] + [col for col in dataframe.columns if col not in ['employee_name', 'department']]
    return dataframe[columnas_ordenadas]

#---------------------------------------------------------------------------------------------------------------
#falta evaluar fechas de ingreso, es mas anomalo teniendo en cuenta la fecha en la que el supervisor comenzó a trabajr

def generate_small_training_csv(path_csv='small_training_employees.csv', n=30, semilla=42):
    np.random.seed(semilla)
    today = datetime.today()

    employee_id = np.arange(1, n + 1)
    total_requests = np.random.randint(0, 21, size=n)  # algunos con 0 solicitudes
    required_days = np.random.randint(1, 31, size=n)
    start_dates = [today - timedelta(days=max(30, int(np.random.normal(loc=730, scale=150)))) for _ in range(n)]
    seniority_days = [(today - d).days for d in start_dates]

    # Cálculos base
    required_days_rate = required_days / np.maximum(total_requests, 1)
    days_per_year = required_days / (np.array(seniority_days) / 365 + 1e-3)
    mon_fri_requests = (required_days * np.random.uniform(0.05, 0.2, size=n)).astype(int)

    # Agregar empleados nuevos con pocas solicitudes (comportamiento normal)
    for i in range(n):
        if seniority_days[i] < 90:
            total_requests[i] = np.random.randint(0, 3)
            required_days[i] = np.random.randint(0, 4)
            required_days_rate[i] = required_days[i] / (total_requests[i] or 1)
            days_per_year[i] = required_days[i] / (seniority_days[i] / 365 + 1e-3)
            mon_fri_requests[i] = np.random.randint(0, 2)

    # Introducir anomalías en el 10% de empleados
    num_anomalies = max(1, int(n * 0.08))
    anomaly_indices = np.random.choice(n, size=num_anomalies, replace=False)

    for idx in anomaly_indices:
        tipo = np.random.choice(["mon_fri", "pide_mucho", "nunca_pide"])
        
        if tipo == "mon_fri":
            # Faltas excesivas lunes/viernes: 50% a 100% de los días requeridos
            mon_fri_requests[idx] = max(mon_fri_requests[idx], int(required_days[idx] * np.random.uniform(0.5, 1.0)))

        elif tipo == "pide_mucho":
            # Solicita muchos días en poco tiempo (2x a 5x más)
            factor = np.random.uniform(2, 5)
            required_days[idx] = min(60, int(required_days[idx] * factor))
            required_days_rate[idx] = required_days[idx] / max(1, total_requests[idx])
            days_per_year[idx] = required_days[idx] / (seniority_days[idx] / 365 + 1e-3)

        elif tipo == "nunca_pide":
            # Si lleva más de 300 días y nunca pidió nada  anomalía
            if seniority_days[idx] > 300:
                total_requests[idx] = 0
                required_days[idx] = 0
                required_days_rate[idx] = 0
                days_per_year[idx] = 0
                mon_fri_requests[idx] = 0
            else:
                # Si es nuevo, no lo marcamos como anómalo
                continue

    # Recalcular todo por si se modificó algo
    required_days = np.clip(required_days, 1, None)
    required_days_rate = required_days / np.maximum(total_requests, 1)
    days_per_year = required_days / (np.array(seniority_days) / 365 + 1e-3)

    df = pd.DataFrame({
        'employee_id': employee_id,
        'total_requests': total_requests,
        'required_days': required_days,
        'required_days_rate': required_days_rate,
        'seniority_days': seniority_days,
        'days_per_year': days_per_year,
        'mon_fri_requests': mon_fri_requests
    })

    df.to_csv(path_csv, index=False)
    return df

def dataframe_pruebas_sup(): # para pruebas
    data = pd.DataFrame({
    'evaluator_id':       [6,   7,     8,      9,    10  ],
    'total_requests':     [0,   730,   180,   80,    1000],
    'approved_requests':  [0,   730,   0,     70,    700],
    'rejected_requests':  [0,   0,     180,    10,   300],
    'seniority_days':     [365, 730,   180,     1,   1],
    })

    data['approval_rate'] = 0.0
    data['rejection_rate'] = 0.0

    data.loc[data['total_requests'] > 0, 'approval_rate'] = (
        data.loc[data['total_requests'] > 0, 'approved_requests'] / data.loc[data['total_requests'] > 0, 'total_requests']
    )

    data.loc[data['total_requests'] > 0, 'rejection_rate'] = (
        data.loc[data['total_requests'] > 0, 'rejected_requests'] / data.loc[data['total_requests'] > 0, 'total_requests']
    )
    return data
def dataframe_pruebas_sup_not(): # para pruebas
    data = pd.DataFrame({
    'evaluator_id':       [6,     7,     8,    9,    10,    11],
    'total_requests':     [360,  730,   10,   1,    2,   0],
    'approved_requests':  [252,  511,   7,   1,    2,    0],
    'rejected_requests':  [108,  219,   3,    0,   1,    0],
    'seniority_days':     [365, 730,   10,    1,   2,      0],
    })

    data['approval_rate'] = 0.0
    data['rejection_rate'] = 0.0

    data.loc[data['total_requests'] > 0, 'approval_rate'] = (
        data.loc[data['total_requests'] > 0, 'approved_requests'] / data.loc[data['total_requests'] > 0, 'total_requests']
    )

    data.loc[data['total_requests'] > 0, 'rejection_rate'] = (
        data.loc[data['total_requests'] > 0, 'rejected_requests'] / data.loc[data['total_requests'] > 0, 'total_requests']
    )
    return data

def dataframe_pruebas_emp(): # para pruebas
    data = pd.DataFrame({
        'employee_id':      [0,    1,  2,   3,   4,    5,    6, 7],
        'total_requests':   [30,   0, 10,   5,   15,   30,   0, 0],
        'required_days':    [54,   0, 30,   15,   180, 108,   0, 0],
        'seniority_days':   [365, 10, 180,  90, 1095,  730, 20, 0],
        'mon_fri_requests': [10,   0, 0,    5,   30,  1,    0, 0]  # <-- nueva métrica
    })

    # Calcular métricas derivadas
    data['required_days_rate'] = 0.0
    data.loc[data['total_requests'] > 0, 'required_days_rate'] = (
        data.loc[data['total_requests'] > 0, 'required_days'] / data.loc[data['total_requests'] > 0, 'total_requests']
    )
    data['days_per_year'] = data['required_days'] / (data['seniority_days'] / 365 + 1e-3)

    return data

    
#-pruebas sup------------------------------------------------------------------------------------------------------

#print(get_supervisor_anomalies())

#generate_supervisors_csv()
#create_model_supervisor('supervisors.csv')
#print(anomalies_supervisors(dataframe_pruebas_sup()))
#print(anomalies_supervisors(dataframe_pruebas_sup_not()))
#get_supervisor_anomalies()
#print()
#pruebas emp-------------------------------------------------------------------------------------------------------

#generate_employees_csv()
#generate_small_training_csv()
#create_model_empleados('employees.csv')
#print(anomalies_employees(dataframe_pruebas_emp()))

#print(create_dataFrame_empleados())

#print(get_employee_anomalies())