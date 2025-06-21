from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from messaging.services.messenger import MessengerService
from licenses.models import License, Status
import logging

logger = logging.getLogger('check_licenses_expired')

class Command(BaseCommand):
    help = 'Actualiza licencias vencidas'

    def handle(self, *args, **options):
        logger.info("Actualizando licencias vencidas. Fecha: " + timezone.now().strftime("%Y-%m-%d"))
        try:
            licenses = License.objects.filter(is_deleted=False, status__name=Status.StatusChoices.MISSING_DOC)
            if not licenses:
                logger.info("No hay licencias vencidas")

            expired_licenses=0
            licenses_expiring_tomorrow=0
            licenses_expiring_today=0

            tomorrow= timezone.now().date() + timedelta(days=1)
            today= timezone.now().date()

            for license in licenses:
                expired_time= license.request_date + timedelta(days=license.required_days)
                if expired_time == tomorrow:
                    MessengerService.send_license_expired_tomorrow(license)
                    logger.info(f"Se notifico al usuario que solicito la licencia {license.license_id} que el ultimo dia para cargar el certificado es mañana")
                    licenses_expiring_tomorrow+=1

                if expired_time == today:
                    MessengerService.send_last_day_to_upload_certificate_message(license)
                    logger.info(f"Se notifico al usuario que solicito la licencia {license.license_id} que el ultimo dia para cargar el certificado es hoy")
                    licenses_expiring_today+=1

                if expired_time < today:
                    license.status.name = Status.StatusChoices.EXPIRED
                    license.status.evaluation_comment = 'Licencia vencida.'
                    MessengerService.send_expired_license_message(license)
                    logger.info(f"Se notifico al usuario que la solicitud de licencia {license.license_id} expiro por falta de certificado")
                    license.status.save()
                    expired_licenses+=1
            
            logger.info(f"Licencias vencidas que se actualizaron: {expired_licenses}")
            logger.info(f"Licencias que expiran mañana: {licenses_expiring_tomorrow}")
            logger.info(f"Licencias que expiran hoy: {licenses_expiring_today}")
        except Exception as e:
            logger.info(f"Error actualizando licencias vencidas: {e}")