import pandas as pd 
import os
import sys
import django
from django.db.models import Q, Count
from datetime import datetime, timedelta

# Configuración Django
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.local')
django.setup()

from licenses.models import HealthFirstUser

def generate_risk_dataset():
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
                licenses__name='Enfermedad',
                licenses__start_date__gte=a_year_ago,
                licenses__status__name='Aprobada', 
                licenses__is_deleted=False
            )
        ),
        accident_license_count=Count(
            'licenses',
            filter=Q(
                licenses__name='Accidente de Trabajo',
                licenses__start_date__gte=a_year_ago,
                licenses__status__name='Aprobada',
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
    
    # Calcular edad
    df['age'] = (today - pd.to_datetime(df['date_of_birth'])).dt.days // 365
    
    # Selección y renombrado de columnas
    df = df[[
        'first_name', 
        'last_name', 
        'age', 
        'email', 
        'department', 
        'sickness_license_count', 
        'accident_license_count'
    ]]
    
    # Renombrar columnas a español
    df.columns = [
        'Nombre',
        'Apellido',
        'Edad',
        'Email',
        'Departamento',
        'Cant_licencias_enfermedad',
        'Cant_licencias_accidente'
    ]
    
    return df