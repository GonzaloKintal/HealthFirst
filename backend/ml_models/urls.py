from django.urls import path
from .views import *


urlpatterns = [
    path('actives', active_models,name='licenses_list'),
    path('all', all_models,name='licenses_list')
 
]