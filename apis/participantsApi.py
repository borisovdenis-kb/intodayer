#                                                МАТRIX OF RIGHTS
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+-------------+
# |       | edit plan | leave plan | del plan | invite part | del part | del admin | del elder | edit rights |
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+-------------+
# | elder |     1     |      0     |      1   |      1      |     1    |     1     |     0     |      1      |
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+-------------+
# | admin |     1     |      1     |      0   |      1      |     1    |     1     |     0     |      1      |
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+-------------+
# | part  |     0     |      1     |      0   |      1      |     0    |     0     |     0     |      0      |
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+-------------+

import json
# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from django.core.exceptions import ObjectDoesNotExist
from intodayer2_app.models import *
from intodayer2_app.views import *
from extra.mailing_api import *
from django.http import HttpResponse


def delete_participant(request):
    """
        On client side use:
            URL: /delete_participant,
            data: plan_id <int>, participant_id <int>
            method: POST
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.POST

        try:
            plan_id = int(data['plan_id'])
            participant_id = int(data['participant_id'])
            PlanLists.objects.get(id=plan_id, owner_id=user.id)  # удаляющий должен быть владельцем расп.
            UserPlans.objects.get(plan_id=plan_id, user_id=participant_id).delete()
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def invite_participants(request):
    """
        On client side use:
            URL: /invite_participants,
            data: plan_id <int>, prt_email_list [<str>, ...]
            method: POST
        example:
            data: {plan_id: 244, prt_email_list: ['aelegend@rambler.ru', 'borisovdenis-kp@yandex.ru]}
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.POST

        try:
            plan_id = int(data['plan_id'])
            prt_email_list = json.loads(data['prt_email_list'])

        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)

