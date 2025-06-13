import pandas as pd 
from django.db.models import Q, Count
from datetime import datetime, timedelta
import sys
import os
import django

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.local')
django.setup()

from users.models import HealthFirstUser,Department


def get_high_risk_department_ids():
    """Devuelve el id de los departamentos considerados como de riesgo"""
    return list(
        Department.objects.filter(
            is_high_risk_department=True
        ).values_list('department_id', flat=True)
    )

def generate_employ_risk_dataframe(id_employ):
    """Genera el dataframe del empleado del que se va a revisar riesgo"""
    today = datetime.now()
    a_year_ago = today - timedelta(days=365)
    user=HealthFirstUser.objects.filter(
        is_deleted=False,
        id=id_employ
    ).annotate(
        sickness_license_count=Count(
            'licenses', 
            filter=Q(
                licenses__type__name='Enfermedad',
                licenses__start_date__gte=a_year_ago,
                licenses__status__name='approved', 
                licenses__is_deleted=False
            )
        ),
        accident_license_count=Count(
            'licenses',
            filter=Q(
                licenses__type__name='Accidente de trabajo',
                licenses__start_date__gte=a_year_ago,
                licenses__status__name='approved',
                licenses__is_deleted=False
            )
        )
    ).values(
        'email',
        'first_name',
        'last_name',
        'department',
        'date_of_birth',
        'sickness_license_count',
        'accident_license_count'
    )
    
    # Convertir a DataFrame
    df = pd.DataFrame.from_records(user)
    
    #Definir si el departamento es o no de riesgo
    high_risk_departments=get_high_risk_department_ids()
    df['in_high_risk_department'] = df['department'].isin(high_risk_departments).astype(int)
    # Calcular edad
    df['age'] = (today - pd.to_datetime(df['date_of_birth'])).dt.days // 365
    
    # Selección y renombrado de columnas
    df = df[[
        'first_name', 
        'last_name', 
        'age', 
        'email', 
        'in_high_risk_department', 
        'sickness_license_count', 
        'accident_license_count'
    ]]
    
    return df



def generate_risk_dataframe():
    """Genera el dataframe de la base de datos"""
    # Fechas límites
    today = datetime.now()
    a_year_ago = today - timedelta(days=365)

    # Query optimizada
    users = HealthFirstUser.objects.filter(
        is_deleted=False
    ).annotate(
        sickness_license_count=Count(
            'licenses', 
            filter=Q(
                licenses__type__name='Enfermedad',
                licenses__start_date__gte=a_year_ago,
                licenses__status__name='approved', 
                licenses__is_deleted=False
            )
        ),
        accident_license_count=Count(
            'licenses',
            filter=Q(
                licenses__type__name='Accidente de trabajo',
                licenses__start_date__gte=a_year_ago,
                licenses__status__name='approved',
                licenses__is_deleted=False
            )
        )
    ).values(
        'email',
        'first_name',
        'last_name',
        'department',
        'date_of_birth',
        'sickness_license_count',
        'accident_license_count'
    )
    
    # Convertir a DataFrame
    df = pd.DataFrame.from_records(users)
    
    #Definir si el departamento es o no de riesgo
    high_risk_departments=get_high_risk_department_ids()
    df['in_high_risk_department'] = df['department'].isin(high_risk_departments).astype(int)
    # Calcular edad
    df['age'] = (today - pd.to_datetime(df['date_of_birth'])).dt.days // 365
    
    # Selección y renombrado de columnas
    df = df[[
        'first_name', 
        'last_name', 
        'age', 
        'email', 
        'in_high_risk_department', 
        'sickness_license_count', 
        'accident_license_count'
    ]]
    
    return df

"""-----------------------------------------------------------------------------------------"""
if __name__ == "__main__":
    #print(generate_risk_dataframe())
    print(generate_employ_risk_dataframe(2))
