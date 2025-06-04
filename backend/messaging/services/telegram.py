from email import message
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

    
def send_message(parse_mode='HTML'):
    """
    Envía un mensaje a un chat específico
    
    Args:
        chat_id: ID del chat (puede ser usuario individual o grupo)
        message: Texto del mensaje
        parse_mode: 'HTML' o 'Markdown' para formato
    """
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        'chat_id': 1867068866,
        'text': "hola gonzalito",
        'parse_mode': parse_mode
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error enviando mensaje a Telegram: {e}")
        return None

def send_message_to_default_chat(self, message):
    """
    Envía mensaje al chat configurado por defecto
    """
    chat_id = getattr(settings, 'TELEGRAM_CHAT_ID', None)
    if not chat_id:
        logger.error("TELEGRAM_CHAT_ID no configurado")
        return None
    
    return self.send_message(chat_id, message)

def send_photo(self, chat_id, photo_url, caption=''):
    """
    Envía una foto
    """
    url = f"{self.base_url}/sendPhoto"
    
    payload = {
        'chat_id': chat_id,
        'photo': photo_url,
        'caption': caption
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error enviando foto a Telegram: {e}")
        return None

def get_chat_info(self, chat_id):
    """
    Obtiene información de un chat
    """
    url = f"{self.base_url}/getChat"
    
    payload = {'chat_id': chat_id}
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error obteniendo info del chat: {e}")
        return None
