from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from messaging.services.messenger import MessengerService
from licenses.models import License, Status

class Command(BaseCommand):
    help = 'Actualiza licencias vencidas'

    def handle(self, *args, **options):
        try:
            licenses = License.objects.filter(is_deleted=False, status__name=Status.StatusChoices.MISSING_DOC)
            if not licenses:
                raise Exception('No se encontraron licencias vencidas.')

            for license in licenses:
                expired_time= license.request_date + timedelta(days=license.required_days)
                expired_licenses=0
                if expired_time == timezone.now().date() + timedelta(days=1):
                    MessengerService.send_license_expired_tomorrow(license)

                if expired_time == timezone.now().date():
                    MessengerService.send_last_day_to_upload_certificate_message(license)

                if expired_time < timezone.now().date():
                    license.status.name = Status.StatusChoices.EXPIRED
                    license.status.evaluation_comment = 'Licencia vencida.'
                    MessengerService.send_expired_license_message(license)
                    license.status.save()
                    expired_licenses+=1
            
            self.stdout.write(f"Licencias vencidas actualizadas: {expired_licenses}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error al actualizar licencias vencidas: {str(e)}"))