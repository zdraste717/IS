"""
URL configuration for mysite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from achievements.views import redirect, login_view, main_view, achiev_view, admin_panel_view

urlpatterns = [
    path('', lambda request: redirect('login'), name='root_redirect'),
    path('login/', login_view, name='login'),
    path('main/', main_view, name='main'),  
    path('achiev/', achiev_view, name='achiev'), 
    path('admin_panel/', admin_panel_view, name='admin_panel') 
]


