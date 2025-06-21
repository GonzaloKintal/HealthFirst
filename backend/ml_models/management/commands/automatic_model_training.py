from django.core.management.base import BaseCommand
from django.utils import timezone
from ml_models.utils.coherence_model_ml import train_and_save_coherence_model
from ml_models.utils.evaluation_model import train_and_save_approval_model, train_and_save_rejection_reason_model
import logging

# Configuración mejorada del logger
logger = logging.getLogger('automatic_models_training')

class Command(BaseCommand):
    help = 'Entrenamiento automático de modelos de ML'
    
    def handle(self, *args, **options):
        # Inicio del proceso
        start_time = timezone.now()
        logger.info(f"\n{'='*50}\nIniciando entrenamiento de modelos - {start_time.strftime('%Y-%m-%d %H:%M:%S')}\n{'='*50}")
        
        try:
            logger.info("Entrenando modelo de coherencia...")
            train_and_save_coherence_model()
            logger.info("Modelo de coherencia entrenado exitosamente")
            
            logger.info("Entrenando modelo de aprobación...")
            train_and_save_approval_model()
            logger.info("Modelo de aprobación entrenado exitosamente")
            
            logger.info("Entrenando modelo de razón de rechazo...")
            train_and_save_rejection_reason_model()
            logger.info("Modelo de razón de rechazo entrenado exitosamente")
            
            # Reporte final
            duration = timezone.now() - start_time
            logger.info(f"\n{'='*50}\nEntrenamiento completado exitosamente\n"
                      f"Duración total: {duration}\n"
                      f"Fecha finalización: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                      f"{'='*50}")
            
        except Exception as e:
            duration = timezone.now() - start_time
            logger.error(f"\n{'='*50}\nError durante el entrenamiento de modelos\n"
                        f"Error: {str(e)}\n"
                        f"Duración hasta error: {duration}\n"
                        f"Fecha error: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                        f"{'='*50}")