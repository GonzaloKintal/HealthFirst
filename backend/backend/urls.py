from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('licenses/', include('licenses.urls')),
    path('metabase/', include('metabase.urls')),
    path('messaging/', include('messaging.urls')),
    path('ml_models/', include('ml_models.urls')),
]