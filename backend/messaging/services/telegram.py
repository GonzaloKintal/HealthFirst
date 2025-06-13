import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class TelegramService:
    @classmethod 
    def send_message(cls,chat_id, message, parse_mode='HTML'):
        """
        Envía un mensaje a un chat específico
        
        Args:
            chat_id: ID del chat (puede ser usuario individual o grupo)
            message: Texto del mensaje
            parse_mode: 'HTML' o 'Markdown' para formato
        """
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
        
        payload = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': parse_mode
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error enviando mensaje a Telegram: {e}")
            return None