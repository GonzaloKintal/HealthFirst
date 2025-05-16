from django.db import migrations
from django.contrib.auth.hashers import make_password

def reverse_create_admin_user(apps, schema_editor):
    HealthFirstUser = apps.get_model('users', 'HealthFirstUser')
    HealthFirstUser.objects.filter(username='admin@admin.com').delete()

def create_admin_user(apps, schema_editor):
    HealthFirstUser = apps.get_model('users', 'HealthFirstUser')
    Department = apps.get_model('users', 'Department')
    Role = apps.get_model('users', 'Role')
    
    if not HealthFirstUser.objects.filter(username='admin@admin.com').exists():
        role, _ = Role.objects.get_or_create(
            name='admin',
            defaults={'description': 'Rol de administrador'}
        )

        department, _ = Department.objects.get_or_create(
            name='Tecnología',
            defaults={'description': 'Departamento de Tecnología'}
        )

        admin = HealthFirstUser(
            username='admin@admin.com',
            email='admin@admin.com',
            first_name='Admin',
            last_name='Admin',
            dni=12345678,
            date_of_birth='1990-01-01',
            employment_start_date='2020-01-01',
            phone='1234567890',
            role=role,
            department=department,
            is_superuser=True,
            password=make_password('administrador')
        )
        admin.save()

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, reverse_create_admin_user ),
        
    ]