from django.urls import path
from .views import *

urlpatterns = [
    path('users', users_list,name='users_list'),
    path('users/register', register_user,name='register_user'),
    path('users/delete/<int:id>', delete_user, name='delete_user'),
    path('users/update/<int:id>', update_user, name='update_user'),
    path('get_user/<str:email>', get_user, name='get_user'),

    path('licenses', licenses_list,name='licenses_list'),
    path('licenses/request', create_license, name='create_license'),
    path('licenses/<int:id>', get_license_detail,name='get_license_detail'),
    path('licenses/<int:id>', delete_license, name='delete-license'),
    path('licenses/<int:id>/evaluation', evaluate_license, name='evaluate-license'),
     
]