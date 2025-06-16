from django.db import models
from django.core.exceptions import ValidationError
# Create your models here.
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
