from django.urls import path
from .views import *

urlpatterns = [
    path('users', users_list,name='users_list'),
    path('users/register', register_user,name='register_user'),
    path('users/delete/<int:id>', delete_user, name='delete_user'),
    path('users/update/<int:id>', update_user, name='update_user'),

    path('licenses', licenses_list,name='licenses_list'),
    path('licenses/request', create_license, name='create_license'),
    path('licenses/<int:id>', delete_license, name='delete-license'),
     
]