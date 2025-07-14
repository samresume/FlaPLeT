from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from solarflare import views


urlpatterns = [
    path('solarflare/', include('solarflare.urls')),
    path('admin/', admin.site.urls),
    path('auth/', obtain_auth_token),
    path('recaptcha/', views.recaptcha)
]
