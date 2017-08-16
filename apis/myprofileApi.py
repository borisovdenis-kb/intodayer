import json
# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from intodayer2_app.models import CustomUser, UserMailingChannels, UserPlans
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.contrib.auth.hashers import check_password, make_password
from extra.validators import validate_password


def update_user_info(request):
    """
        This endpoint to update user profile info.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = json.loads(request.body.decode('utf-8'))

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
        user = CustomUser.objects.get(email=request.user.email)
        data = json.loads(request.body.decode('utf-8'))

        if check_password(data['old_password'], user.password):
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=400)
    else:
        return HttpResponse(status=401)


def make_new_password(request):
    """
        This endpoint to make new user password.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = json.loads(request.body.decode('utf-8'))

        try:
            validate_password(data['new_password'])
            user.update(**{'password': make_password(data['new_password'])})
        except ValidationError:
            return HttpResponse(status=400)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def upload_user_avatar(request):
    """
        This endpoint to set avatar to user.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)

        try:
            # удаляем предыдущую аватарку
            user.avatar.delete()
            # сохраняем новую
            user.update(**{'avatar': request.FILES['avatar']})
        except (ValueError, ValidationError):
            return HttpResponse(status=400)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def get_user_plans(request):
    """
        This endpoint to get user's plans.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        context = {}

        try:
            user_plans = UserPlans.objects.select_related().filter(user_id=user.id)
            context['user_plans'] = user_plans
        except ObjectDoesNotExist:
            return HttpResponse(status=400)

        return render_to_response('templates_for_ajax/user_plans.html', context, status=200)
    else:
        return HttpResponse(status=401)
