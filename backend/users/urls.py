from django.urls import path
from .views import *
from rest_framework_simplejwt.views import  TokenRefreshView

urlpatterns = [

    path('token',  CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),

    path('', users_list,name='users_list'),
    path('register', register_user,name='register_user'),
    path('delete/<int:id>', delete_user, name='delete_user'),
    path('update/<int:id>', update_user, name='update_user'),
    path('get_user/<int:id>', get_user, name='get_user'),
    path('get_users_by_filter', get_users_by_filter, name='get_user_by_filter'),

    path('department/create', create_department, name='create_department'),
]