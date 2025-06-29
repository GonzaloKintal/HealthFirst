from django.urls import path
from .views import *


urlpatterns = [
    #urls de telegram
    path('add_telegram_suscription', add_telegram_suscription,name='add-telegram-subscription'),
    path('remove_telegram_suscription/<int:id>', remove_telegram_suscription,name='remove-telegram-subscription'),
    path('get_telegram_suscription/<int:id>', get_telegram_suscription, name='get-telegram-subscription'),


    #url de email
    path('get_email_stats', get_email_stats,name='get-email-stats'),
    path('get_email_events', get_email_events,name='get-email-events'),
    path('get_user_email_events', get_user_email_events,name='get-user-email-events'),  

    path('send_personalized_message', send_personalized_message,name='send-personalized-message'),
    path('telegram-webhook/', telegram_webhook, name='telegram_webhook'),

]