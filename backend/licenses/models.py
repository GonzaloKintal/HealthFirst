from django.db import models
from users.models import HealthFirstUser
from django.utils import timezone
from licenses.utils import file_utils

# Create your models here.
class Status(models.Model):
    # Todos los estados validos posibles 
    class StatusChoices(models.TextChoices):
        MISSING_DOC = 'missing_doc', 'Documentacion faltante'
        PENDING = 'pending', 'Pendiente de aprobacion'
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
    justified = models.BooleanField(default=False)
    certificate_need = models.BooleanField(default=False)
    certificate_immediate = models.BooleanField(default=False)
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
