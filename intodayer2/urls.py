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
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.welcome_view),
    url(r'^login/$', views.login_view),
    url(r'^home/$', views.home_view),
    url(r'^logout/$', views.logout_view),
    url(r'^registration/$', views.registration_view),
    url(r'^profile/$', views.profile_settings),
    url(r'^plan/$', views.plan_view),
    url(r'^statistics/$', views.plan_view),

    # для ajax запросов
    # url(r'^plan/update_clone', views.plan_clone_ajax),
    url(r'^plan/update_delete', views.plan_delete_ajax),
    url(r'^plan/edit_plan_row', views.edit_plan_row_ajax),
    url(r'^home/switch_plan', views.switch_plan_home_ajax),
    url(r'^get_invitations', views.get_invitations_ajax),
    url(r'^plan/invitation/(\d+)$', views.plan_view),
    url(r'^confirm_invitation', views.confirm_invitation_ajax),
    url(r'^upload_user_avatar$', views.save_user_avatar_ajax),
    url(r'^upload_plan_avatar/(\d+)$', views.save_plan_avatar_ajax),
    url(r'^get_avatar', views.get_avatar_ajax),
    url(r'^plan/update_delete', views.plan_delete_ajax),
    url(r'^plan/edit_plan_row', views.edit_plan_row_ajax),
    url(r'^mailing', views.mailing_ajax),
    url(r'^get_drop_list', views.get_drop_list_ajax),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)