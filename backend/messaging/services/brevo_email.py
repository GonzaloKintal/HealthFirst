from django.core.mail import send_mail
import requests
from django.conf import settings
    
def send_email(subject,message, to_email):
    send_mail(
        subject,
        message,
        settings.EMAIL_HEALTH_FIRST,
        [to_email],
     )

def get_brevo_stats():
    url = "https://api.brevo.com/v3/smtp/statistics/aggregatedReport"
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY, 
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()  
    return None

def get_brevo_events(days=7, email=None, event_type=None):
    """
    Obtiene eventos recientes de Brevo
    
    Args:
        days: Días hacia atrás (máximo 90)
        email: Filtrar por email específico (opcional)
        event_type: Tipo de evento - sent, delivered, bounced, opened, clicked, etc. (opcional)
    """
    url = "https://api.brevo.com/v3/smtp/statistics/events"
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
    }
    
    params = {
        "days": days,
        "limit": 100  # Máximo por llamada
    }
    
    # Agregar filtros opcionales
    if email:
        params["email"] = email
    if event_type:
        params["event"] = event_type
    
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    return None

def get_all_brevo_events(days=7, email=None, event_type=None):
    """
    Obtiene TODOS los eventos usando paginación automática
    """
    all_events = []
    offset = 0
    
    while True:
        url = "https://api.brevo.com/v3/smtp/statistics/events"
        headers = {
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
        }
        
        params = {
            "days": days,
            "limit": 100,
            "offset": offset
        }
        
        if email:
            params["email"] = email
        if event_type:
            params["event"] = event_type
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            break
            
        data = response.json()
        events = data.get('events', [])
        
        if not events:
            break
            
        all_events.extend(events)
        
        # Si recibimos menos de 100, ya no hay más
        if len(events) < 100:
            break
            
        offset += 100
    
    return all_events

def get_recent_opens(days=7):
    """Obtiene solo los eventos de apertura"""
    return get_all_brevo_events(days=days, event_type="opened")


def get_user_activity(email, days=30):
    """Obtiene toda la actividad de un usuario específico"""
    return get_all_brevo_events(days=days, email=email)


