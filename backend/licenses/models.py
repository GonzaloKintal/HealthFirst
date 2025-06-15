from django.db import models
from users.models import HealthFirstUser
from django.utils import timezone
from licenses.utils import file_utils
from django.core.exceptions import ValidationError

# Create your models here.
class Status(models.Model):
    # Todos los estados validos posibles 
    class StatusChoices(models.TextChoices):
        MISSING_DOC = 'missing_doc', 'Documentacion faltante'
        PENDING = 'pending', 'Pendiente de aprobación'
        REJECTED = 'rejected', 'Rechazada'
        APPROVED = 'approved', 'Aprobada'
        EXPIRED = 'expired', 'Expirada'

    status_id = models.AutoField(primary_key=True)
    license = models.OneToOneField('License', on_delete=models.CASCADE, related_name='status')
    name = models.CharField(max_length=100, choices=StatusChoices.choices)
    evaluation_date = models.DateField(null=True, blank=True)
    evaluation_comment = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Estado {self.name} - Licencia {self.license.license_id}"  

class LicenseType(models.Model):
    name=models.CharField(max_length=40,null=False, blank=False)
    description=models.CharField(max_length=100,null=False, blank=False)
    min_advance_notice_days=models.IntegerField(null=False, blank=False)
    certificate_require= models.BooleanField(default=True)
    tolerance_days_certificate_submission=models.IntegerField(null=True, blank=True)
    total_days_granted=models.IntegerField(null=True, blank=True)
    max_consecutive_days=models.IntegerField(null=True, blank=True)
    yearly_approved_requests=models.IntegerField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)


    @property
    def group(self):
        license_group_map = {
            'Accidente de trabajo': 'accidente_trabajo',
            'Donación de sangre': 'donacion_sangre',
            'Duelo(A)': 'duelo',
            'Duelo(B)': 'duelo',
            'Enfermedad': 'enfermedad',
            'Asistencia a familiares': 'asistencia_familiares',
            'Estudios': 'estudios',
            'Casamiento': 'matrimonial',
            'Casamiento de hijos': 'matrimonial',
            'Trámites patriomaniales': 'matrimonial',
            'Mudanza': 'mudanza',
            'Obligaciones públicas': 'gremial',
            'Reunión gremial': 'gremial',
            'Representante gremial': 'gremial',
            'Reunión extraordinaria': 'gremial',
            'Nacimiento de hijo': 'nacimiento',
            'Maternidad': 'salud_materna',
            'Control prenatal': 'salud_materna',
            'Vacaciones': 'vacaciones',
        }
        return license_group_map.get(self.name, 'otro')



    def requieres_inmediate_certificate(self):
        return self.certificate_require and self.tolerance_days_certificate_submission==0


class License(models.Model):
    license_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(HealthFirstUser, on_delete=models.CASCADE, related_name='licenses')
    type = models.ForeignKey(LicenseType, on_delete=models.CASCADE, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    required_days = models.PositiveIntegerField()
    information = models.TextField(blank=True, null=True)
    request_date = models.DateField()
    closing_date = models.DateField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    evaluator=models.ForeignKey(HealthFirstUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='evaluator')

    def __str__(self):
        return f"Licencia {self.license_id} - {self.user}"
    
    def save(self, *args, **kwargs):
        # Guardamos una copia para comparar luego si cambió
        is_new = self.pk is None
        old_is_deleted = None

        if not is_new:
            old_instance = License.objects.filter(pk=self.pk).first()
            if old_instance:
                old_is_deleted = old_instance.is_deleted

        super().save(*args, **kwargs)

        # Si cambió el estado de is_deleted a True
        if not is_new and old_is_deleted is False and self.is_deleted is True:
            try:
                certificate = self.certificate
                certificate.is_deleted = True
                certificate.deleted_at = timezone.now()
                certificate.save()
            except Certificate.DoesNotExist:
                pass  # No tiene certificado, no hacemos nada
    def assign_status(self):
        try:
            certificate=self.certificate
        except Certificate.DoesNotExist:
            certificate=None

        if self.type.certificate_require and certificate is None:
            default_status = Status.StatusChoices.MISSING_DOC
        else:
            default_status = Status.StatusChoices.PENDING

        Status.objects.create(
            license=self,
            name=default_status,
            evaluation_comment='Nueva solicitud.'
        )

    def get_detail_for_message(self):
        return (
                f"🪪 Licencia #{self.license_id}\n"
                f"📅 Solicitada: {self.request_date.strftime('%d/%m/%Y')}\n"
                f"✅ Estado: {self.status.get_name_display()}\n"
                f"🗓️ Desde: {self.start_date.strftime('%d/%m/%Y')} "
                f"hasta {self.end_date.strftime('%d/%m/%Y')}\n"
                f"📝 Tipo de licencia: {self.type.name}"
            )




class Certificate(models.Model):
    certificate_id = models.AutoField(primary_key=True)
    license = models.OneToOneField(License, on_delete=models.CASCADE, related_name='certificate')
    file = models.TextField(blank=True, null=True)
    validation = models.BooleanField(default=False)
    upload_date = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Certificado {self.certificate_id} - Licencia {self.license.license_id}"
    
    def check_CertificateOwnership_And_Date(self):
        if self.file is not None and self.file.strip() != "": #si no esta vacio o es un text de espacios blancos
            certificate_text=file_utils.base64_to_text(self.file,es_imagen=file_utils.es_pdf_imagen(self.file)) #me traigo el certificado  en texto
            keys=[self.license.user.first_name,self.license.user.last_name,str(self.license.user.dni)] #ojo con dni con punto, se queda con las palabras claves para ownership
            return file_utils.search_in_pdf_text(keys,certificate_text) and file_utils.date_in_range(certificate_text,self.license) #si encontró las palabras claves y una fecha que en el certificado que entra en rango
        return False


class LicenseDatasetEntry(models.Model):
    GROUP_CHOICES = [
        ('accidente_trabajo', 'Accidente de trabajo'),
        ('donacion_sangre', 'Donación de sangre'),
        ('duelo', 'Duelo tipo A y B'),
        ('enfermedad', 'Enfermedad'),
        ('asistencia_familiares', 'Asistencia de familiares'),
        ('estudios', 'Estudios'),
        ('matrimonial', 'Matrimonial'),
        ('mudanza', 'Mudanza'),
        ('gremial', 'Gremial'),
        ('nacimiento', 'Nacimiento'),
        ('salud_materna', 'Salud Materna'),
        ('vacaciones', 'Vacaciones'),
        ('otro', 'Otro'),
    ]

    STATUS_CHOICES = [
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]

    text = models.TextField()
    type = models.CharField(max_length=30, choices=GROUP_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    reason = models.TextField(blank=True, null=True)

    def clean(self):
        if self.status == 'rejected' and not self.reason:
            raise ValidationError('Debe especificar un motivo si el estado es "rejected".')

    def __str__(self):
        return f"{self.type} ({self.status})"
