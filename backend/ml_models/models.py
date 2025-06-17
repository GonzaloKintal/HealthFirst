from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal
from django.db import transaction
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


class MLModel(models.Model):
    MODEL_TYPES = [
        ('ANOMALY_DETECTION', 'Detección de anomalías'),
        ('CLASSIFICATION', 'Coherencia de certificados'),
        ('REGRESSION', 'Regresión'),
        ('HEALTH_RISK', 'Predicción de riesgo de salud'),
        ('LICENSE_APPROVAL', 'Aprobación de licencias'),
        ('REJECTION_REASON', 'Clasificación de motivo de rechazo'),
    ]

    ALGORITHMS = [
        ('ISOLATION_FOREST', 'Isolation Forest'),
        ('RANDOM_FOREST', 'Random Forest'),
        ('LOGISTIC_REGRESSION', 'Regresión Logística'),
        ('LGBM', 'LightGBM'),
    ]

    name = models.CharField(max_length=50, verbose_name="Nombre")
    model_type = models.CharField(
        max_length=50,
        choices=MODEL_TYPES,
        verbose_name="Tipo de modelo"
    )
    algorithm = models.CharField(
        max_length=50,
        choices=ALGORITHMS,
        verbose_name="Algoritmo"
    )
    version = models.DecimalField(
        max_digits=3,          # Máximo: 99.9 (2 enteros + 1 decimal)
        decimal_places=1,       # 1 decimal (ej: 1.0, 1.1, etc.)
        default=Decimal('1.0'), # Versión inicial
        verbose_name="Versión"
    )

    is_active = models.BooleanField(default=False, verbose_name="¿Activo?")
    training_date = models.DateTimeField(verbose_name="Fecha de entrenamiento")
    first_training_id = models.IntegerField(
        verbose_name="Primer ID de entrenamiento",
        help_text="ID del primer registro usado para entrenar el modelo",
        null=True,
        blank=True
    )
    last_training_id = models.IntegerField(
        verbose_name="Último ID de entrenamiento",
        help_text="ID del último registro usado para entrenar el modelo",
        null=True,
        blank=True
    )
    

    class Meta:
        verbose_name = "Modelo de ML"
        verbose_name_plural = "Modelos de ML"
        unique_together = [['name', 'version']]  

    def __str__(self):
        return f"{self.name} (v{self.version}) - {self.algorithm}"




    def save(self, *args, **kwargs):
        # Usar transacción atómica para evitar inconsistencias
        with transaction.atomic():
            # Bloquear el registro para evitar condiciones de carrera
            active_model = MLModel.objects.select_for_update().filter(
                model_type=self.model_type,
                is_active=True
            ).first()
            
            if active_model:
                self.version = Decimal(str(active_model.version)) + Decimal('0.1')
                # Actualización directa sin llamar a save()
                MLModel.objects.filter(pk=active_model.pk).update(is_active=False)
            else:
                self.version = Decimal('1.0')
                
            self.is_active = True
            super().save(*args, **kwargs)
