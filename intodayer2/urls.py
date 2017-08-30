# -*- coding: utf-8 -*-

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
from api import (
    planApi, participantsApi, myprofileApi, invitationsApi, registrationApi
)

# favicon_view = RedirectView.as_view(url='favicon.ico', permanent=True)


urlpatterns = [
    url(r'^admin/', admin.site.urls),

    # получение основных страниц
    url(r'^$', views.welcome_view),
    url(r'^home/$', views.home_view),
    url(r'^plan/$', views.plan_view),
    url(r'^login/$', views.login_view, {'message_type': None}),
    url(r'^login/(\w+)$', views.login_view),
    url(r'^logout/$', views.logout_view),
    url(r'^account/$', views.profile_view),
    url(r'^statistics/$', views.statistics_view),
    url(r'^registration/$', views.registration_view),
    url(r'^participants/$', views.participant_view),
    url(r'^about_service/$', views.about_service_view),
    url(r'check_email_unique', views.check_email_unique),

    # для ajax запросов
    url(r'^get_invitations', views.get_invitations_ajax),
    url(r'^home/switch_plan', views.switch_plan_home_ajax),
    url(r'^plan/edit_plan_row', views.edit_plan_row_ajax),
    url(r'^plan/update_delete', views.plan_delete_ajax),
    url(r'^plan/invitation/(\d+)$', views.plan_view),

    # подгрузка контентов
    url(r'^left_content', views.left_content_load_ajax),

    # API расписания
    url(r'^get_avatar', planApi.get_avatar),
    url(r'^leave_plan', planApi.leave_plan),
    url(r'^delete_plan', planApi.delete_plan),
    url(r'^create_plan', planApi.create_plan),
    url(r'^test_mailing', planApi.mailing_test),
    url(r'^get_drop_list', planApi.get_drop_list),
    url(r'^update_plan_info', planApi.update_plan_info),
    url(r'^plan/switch_plan', planApi.switch_plan_plan),
    url(r'^upload_plan_avatar', planApi.upload_plan_avatar),
    url(r'^plan/settings_plan', views.get_settings_plan_html),
    url(r'^change_current_plan', planApi.change_current_plan),
    url(r'^plan/invite_setting_plan', views.get_invite_settings_html),

    # API участников
    url(r'^change_role', participantsApi.set_role),
    url(r'^cancel_invitation', participantsApi.cancel_invitation),
    url(r'^delete_participant', participantsApi.delete_participant),
    url(r'^invite_participants', participantsApi.invite_participants),
    url(r'^check_email_not_invited', participantsApi.check_email_not_invited),
    url(r'^participants/switch_plan', participantsApi.switch_plan_participants),
    url(r'^get_expected_participants', participantsApi.get_expected_participants),

    # API моего профиля
    url(r'^get_user_plans', myprofileApi.get_user_plans),
    url(r'^update_user_info', myprofileApi.update_user_info),
    url(r'^make_new_password', myprofileApi.make_new_password),
    url(r'^upload_user_avatar', myprofileApi.upload_user_avatar),
    url(r'^check_old_password', myprofileApi.check_old_password),

    # API приглашений
    url(r'^invitation/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', invitationsApi.verify_invitation),
    url(r'^invitation/confirm/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', invitationsApi.confirm_invitation),

    # API регистрации
    url(r'^activate/([0-9a-f]{64})', registrationApi.activate_email),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
