from django.urls import path
from .views import metabase_iframe_url

urlpatterns = [
    path("signed-url/", metabase_iframe_url, name="metabase_signed_url"),
]