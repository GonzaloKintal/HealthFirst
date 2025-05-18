from django.urls import path
from .views import *


urlpatterns = [
    path('', licenses_list,name='licenses_list'),
    path('request', create_license, name='create_license'),
    path('<int:id>', get_license_detail,name='get_license_detail'),
    path('delete/<int:id>', delete_license, name='delete-license'),
    path('update/<int:id>', update_license, name='update_license'),
    path('<int:id>/evaluation', evaluate_license, name='evaluate-license'),
    path('update_expired', update_expired, name='expired_licenses'),

    path('get_licenses_types', get_licenses_types, name='get_licenses_types'),

    path('certificate/coherence', upload_base64_file,name='upload_base64_file'),     
]