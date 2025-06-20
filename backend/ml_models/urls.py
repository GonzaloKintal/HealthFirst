from django.urls import path
from .views import *


urlpatterns = [
    path('actives', active_models),
    path('all', all_models),
    path('training', train_models),
 
]