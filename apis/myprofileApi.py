# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from intodayer2_app.models import *
from django.http import HttpResponse


def update_user_profile_info(request):
    """
        On client side use:
            URL: /update_user_profile_info,
            data: {
                channels: {
                    telegram: y/n,
                    email: y/n
                },
                user: {
                    first_name: <str>,
                    last_name: <str>
                }
            }
            method: POST
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        user_channels = UserMailingChannels.objects.get(user_id=user.id)
        data = request.POST

        data_is_correct = all([data['first_name'], data['last_name']])

        if data_is_correct:
            user.update(**data['user'])
            user_channels.update(**data['channels'])
        else:
            return HttpResponse(status=400)
    else:
        return HttpResponse(status=401)
