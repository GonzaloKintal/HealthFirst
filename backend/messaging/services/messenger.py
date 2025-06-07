from .telegram import TelegramService
from .brevo_email import send_email

class MessengerService:
    def send_welcome_message(user):
        subject = "Bienvenido a Health First"
        message = f"""
        ¡Bienvenido/a a Health First, {user.first_name} {user.last_name}!

        Por este medio te mantendremos informado/a sobre tus novedades.
        Un administrador te otorgara las credenciales de acceso.  
        Una vez que tengas tus credenciales,
        puedes suscribirte a nuestro canal de Telegram para recibir notificaciones instantáneas:  
        https://healthfirst-one.vercel.app/settings

        ¡Gracias por confiar en nosotros!  
        Equipo Health First  
        """
        send_email(subject, message, user.email)


    def send_rejected_license_message(license):
        user = license.user
        subject = "Licencia rechazada"
        message = (
            f"¡Hola {user.first_name} {user.last_name}!\n\n"
            f"Lamentamos informarte que hemos rechazado tu licencia de {license.type.name}.\n\n"
            f"Motivo:\n{license.status.evaluation_comment}\n\n"
            "Para más detalles contactate con tu supervisor.\n\n"
            "¡Gracias por confiar en nosotros!\n"
            "Equipo Health First"
        )
        MessengerService.send_personalized_message(user, subject, message)



    def send_approved_license_message(license):
        user = license.user
        subject = "Solicitud de licencia aprobada"
        message = (
            f"¡Hola {user.first_name} {user.last_name}!\n\n"
            f"Es de nuestro gusto informarte que hemos aprobado tu licencia de {license.type.name}.\n\n"
            "¡Gracias por confiar en nosotros!\n"
            "Equipo Health First"
        )
        MessengerService.send_personalized_message(user, subject, message)



    def send_expired_license_message(license):
        user=license.user
        subject = "Solicitud de licencia expirada"
        message = (
            f"¡Hola {user.first_name} {user.last_name}!\n\n"
            f"Te informamos que tu licencia de {license.type.name} ha expirado "
            "debido a que no cargaste tu certificado en el tiempo requerido.\n"
            "Cualquier duda contactate con tu supervisor.\n\n"
            "¡Gracias por confiar en nosotros!\n"
            "Equipo Health First"
        )
        MessengerService.send_personalized_message(user, subject, message)


    def send_license_expired_tomorrow(license):
        user = license.user
        subject = "Tu solicitud de licencia expira pronto"
        message = (
            f"¡Hola {user.first_name} {user.last_name}!\n\n"
            f"Te informamos que tu solicitud de licencia de {license.type.name} vence mañana.\n"
            "Tenes entre hoy y mañana para cargar tu certificado.\n"
            "Cualquier duda contactate con tu supervisor.\n\n"
            "¡Gracias por confiar en nosotros!\n"
            "Equipo Health First"
        )
        MessengerService.send_personalized_message(user, subject, message)

    def send_last_day_to_upload_certificate_message(license):
        user = license.user
        subject = "Tu solicitud de licencia expira hoy"
        message = (
            f"¡Hola {user.first_name} {user.last_name}!\n\n"
            f"Te informamos que tu solicitud de licencia de {license.type.name} vence hoy.\n"
            "Hoy es el último día para cargar tu certificado.\n"
            "Cualquier duda contactate con tu supervisor.\n\n"
            "¡Gracias por confiar en nosotros!\n"
            "Equipo Health First"
        )
        MessengerService.send_personalized_message(user, subject, message)


#    def send_personalized_message(user, subject, message):
#        send_email(subject, message, user.email)
#        if user.is_telegram_suscriptor:
#            TelegramService.send_message(chat_id=user.telegram_id, message=message)

