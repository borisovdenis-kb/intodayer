import json
# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from intodayer2_app.models import CustomUser, UserMailingChannels
from django.http import HttpResponse, JsonResponse
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import check_password, make_password
from extra.validators import validate_password


def update_user_info(request):
    """
        This endpoint to update user profile info.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = json.loads(request.body)

        try:
            user_channels = UserMailingChannels.objects.get(user_id=user.id)

            user.update(**data['user'])
            user_channels.update(**data['channels'])
        except ValidationError:
            return HttpResponse(status=400)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def check_old_password(request):
    """
        This endpoint to check old user password.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = json.loads(request.body)

        if check_password(data['old_password'], user.password):
            return JsonResponse({'old_password_is_correct': True}, status=200)
        else:
            return JsonResponse({'old_password_is_correct': False}, status=200)
    else:
        return HttpResponse(status=401)


def make_new_password(request):
    """
        This endpoint to make new user password.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = json.loads(request.body)

        try:
            validate_password(data['new_password'])
            user.update(**{'password': make_password(data['new_password'])})
        except ValidationError:
            return HttpResponse(status=400)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)
