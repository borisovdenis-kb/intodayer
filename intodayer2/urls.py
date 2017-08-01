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
from apis import planApi, participantsApi
from django.conf.urls.static import static

# favicon_view = RedirectView.as_view(url='favicon.ico', permanent=True)


urlpatterns = [
    url(r'^admin/', admin.site.urls),

    # получение основных страниц
    url(r'^$', views.welcome_view),
    url(r'^home/$', views.home_view),
    url(r'^plan/$', views.plan_view),
    url(r'^login/$', views.login_view),
    url(r'^logout/$', views.logout_view),
    url(r'^profile/$', views.profile_settings),
    url(r'^account/$', views.profile_page),
    url(r'^statistics/$', views.statistics_view),
    url(r'^registration/$', views.registration_view),
    url(r'^participants/$', views.participant_page),
    url(r'^about_service/$', views.about_service_view),

    # для ajax запросов
    url(r'^get_avatar', views.get_avatar_ajax),
    url(r'^get_invitations', views.get_invitations_ajax),
    url(r'^home/switch_plan', views.switch_plan_home_ajax),
    url(r'^plan/switch_plan', views.switch_plan_plan_ajax),
    url(r'^participants/switch_plan', views.switch_plan_participants_ajax),
    url(r'^plan/edit_plan_row', views.edit_plan_row_ajax),
    url(r'^plan/update_delete', views.plan_delete_ajax),
    url(r'^confirm_invitation', views.confirm_invitation_ajax),
    url(r'^upload_user_avatar$', views.save_user_avatar_ajax),
    url(r'^switch_plan_only_set', views.switch_plan_only_set_ajax),
    url(r'^plan/invitation/(\d+)$', views.plan_view),

    # рассылка
    url(r'^mailing', views.mailing_ajax),

    # подгрузка контентов
    url(r'^left_content', views.left_content_load_ajax),
    url(r'^plan/plan_content_only', views.right_plan_content_only),
    # url(r'^empty_plans', views.plan_empty),
    # url(r'^favicon\.ico$', favicon_view),

    # API расписания
    url(r'^delete_plan', planApi.delete_plan),
    url(r'^get_drop_list', planApi.get_drop_list),
    url(r'^create_new_plan', planApi.create_plan),
    url(r'^update_plan_info', planApi.update_plan_info),
    url(r'^plan/settings_plan', views.get_settings_plan_html),
    url(r'^upload_plan_avatar', planApi.upload_plan_avatar),
    url(r'^test_mailing', planApi.mailing_test),

    # API участников
    url(r'^change_role', participantsApi.set_role),
    url(r'^delete_participant', participantsApi.delete_participant),
    url(r'^invite_participants', participantsApi.invite_participants),
    url(r'^get_expected_participants', participantsApi.get_expected_participants),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
