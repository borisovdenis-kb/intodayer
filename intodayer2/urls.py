"""intodayer2 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from intodayer2_app import views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.welcome_view),
    url(r'^login/$', views.login_view),
    url(r'^home/$', views.home_view),
    url(r'^logout/$', views.logout_view),
    url(r'^registration/$', views.registration_view),
    url(r'^profile/$', views.profile_settings),
    url(r'^add_schedules/$', views.add_schedules_view),
    url(r'^plan/$', views.plan_view),
    url(r'^home/switch_plan', views.switch_plan_home_ajax),
    url(r'^get_invitations', views.get_invitations_ajax),
    url(r'^plan/invitation/(\d+)$', views.plan_view),
    # url(r'^add_plans/$', views.add_plans_view),
]