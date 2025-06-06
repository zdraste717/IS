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
from achievements import views

urlpatterns = [
    path('', lambda request: views.redirect('login'), name='root_redirect'),
    path('login/', views.login_view, name='login'),
    path('main/', views.main_view, name='main'),  
    path('achiev/', views.achiev_view, name='achiev'), 
    path('admin_panel/', views.admin_panel_view, name='admin_panel'),
    path('submit-application/', views.submit_application, name='submit_application'),
    path('admin_pending/', views.admin_pending_view, name='admin_pending'),
    path('update_achievement/', views.update_achievement_status, name='update_achievement_status'),
    path('generate_report/', views.generate_report_docx, name='generate_report_docx'),
    path('logout/', views.logout_view, name='logout')
]


