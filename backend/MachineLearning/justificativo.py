from datetime import date, datetime
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from dashboard_api.models import License

def type_analisis(license_id):
    