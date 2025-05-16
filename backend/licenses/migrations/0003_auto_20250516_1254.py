from django.db import migrations,connection

def reset_license_types(apps, schema_editor):
    LicenseType = apps.get_model('licenses', 'LicenseType')

    LicenseType.objects.all().delete()

    with connection.cursor() as cursor:
        cursor.execute("ALTER SEQUENCE licenses_licensetype_id_seq RESTART WITH 1;")

    insert_licenses_types(apps, schema_editor)

def insert_licenses_types(apps, schema_editor):
    LicenseType = apps.get_model('licenses', 'LicenseType')
    LicenseType.objects.bulk_create([
        LicenseType(
            name='Vacaciones',
            description='Días de descanso anual',
            certificate_require=False,
            min_advance_notice_days=2,
            yearly_approved_requests=2
        ),
        LicenseType(
            name='Nacimiento de hijo',
            description='Licencia por cuidado de hijos',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=3,
            max_consecutive_days=2,
            yearly_approved_requests=2
        ),
        LicenseType(
            name='Estudios',
            description='Licencia por estudios',
            certificate_require=True,
            min_advance_notice_days=3,
            tolerance_days_certificate_submission=6,
            total_days_granted=24,
            max_consecutive_days=4,
        ),
        LicenseType(
            name='Maternidad',
            description='Licencia por maternidad',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=7,
            total_days_granted=90,
            yearly_approved_requests=2
        ),
        LicenseType(
            name='Control prenatal',
            description='Licencia para controles medicos',
            certificate_require=True,
            min_advance_notice_days=3,
            tolerance_days_certificate_submission=2,
            max_consecutive_days=1
        ),
        LicenseType(
            name='Accidente de trabajo',
            description='Licencia por accidente laboral',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=1,
        ),
        LicenseType(
            name='Enfermedad',
            description='Licencia por enfermedad',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=1,
        ),
        LicenseType(
            name='Casamiento',
            description='Licencia por matrimonio',
            certificate_require=True,
            min_advance_notice_days=7,
            tolerance_days_certificate_submission=7,
            max_consecutive_days=12,
            yearly_approved_requests=1
        ),
        LicenseType(
            name='Trámites patriomaniales',
            description='Tramites prematrimoniales',
            certificate_require=True,
            min_advance_notice_days=7,
            tolerance_days_certificate_submission=0,
            max_consecutive_days=1,
            yearly_approved_requests=1
        ),
        LicenseType(
            name='Casamiento de hijos',
            description='Licencia por matrimonio de hijos',
            certificate_require=True,
            min_advance_notice_days=7,
            tolerance_days_certificate_submission=7,
            max_consecutive_days=1,
            yearly_approved_requests=2
        ),
        LicenseType(
            name='Asistencia a familiares',
            description='Licencia para cuidar familiares',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=3,
            total_days_granted=30,
        ),
        LicenseType(
            name='Duelo(A)',
            description='Licencia por duelo tipo A',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=7,
            max_consecutive_days=6,
        ),
        LicenseType(
            name='Duelo(B)',
            description='Licencia por duelo tipo B',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=5,
            max_consecutive_days=4,
        ),
        LicenseType(
            name='Donación de sangre',
            description='Licencia por donar sangre',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=1,
            max_consecutive_days=1,
            yearly_approved_requests=6,
        ),
        LicenseType(
            name='Mudanza',
            description='Licencia por mudanza',
            certificate_require=True,
            min_advance_notice_days=1,
            tolerance_days_certificate_submission=1,
            max_consecutive_days=2,
            yearly_approved_requests=2,
        ),
        LicenseType(
            name='Obligaciones públicas',
            description='Licencia por obligaciones públicas',
            certificate_require=True,
            min_advance_notice_days=1,
            tolerance_days_certificate_submission=2,
            max_consecutive_days=1,
        ),
        LicenseType(
            name='Hora mensual',
            description='Licencia horaria mensual',
            certificate_require=False,
            min_advance_notice_days=1,
            max_consecutive_days=1,
            yearly_approved_requests=12,
        ),
        LicenseType(
            name='Cumpleaños',
            description='Licencia por cumpleaños',
            certificate_require=False,
            min_advance_notice_days=2,
            total_days_granted=1,
            max_consecutive_days=1,
            yearly_approved_requests=1,
        ),
        LicenseType(
            name='Reunión gremial',
            description='Licencia por reunión gremial',
            certificate_require=True,
            min_advance_notice_days=2,
            tolerance_days_certificate_submission=0,
            max_consecutive_days=1,
            yearly_approved_requests=52,
        ),
        LicenseType(
            name='Representante gremial',
            description='Licencia para representantes gremiales',
            certificate_require=True,
            tolerance_days_certificate_submission=0,
            min_advance_notice_days=0,
            max_consecutive_days=1,
        ),
        LicenseType(
            name='Reunión extraordinaria',
            description='Licencia para reuniones urgentes',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=0,
            max_consecutive_days=1,
        ),
        LicenseType(
            name='Otros',
            description='Otras licencias no especificadas',
            certificate_require=True,
            min_advance_notice_days=0,
            tolerance_days_certificate_submission=0,
        )
    ])

class Migration(migrations.Migration):

    dependencies = [
        ('licenses', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(reset_license_types),
    ]
