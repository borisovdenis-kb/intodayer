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

# TODO: Заняться оптимизацией запросов!!!


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
            who_delete = UserPlans.objects.get(plan_id=plan_id, user_id=user.id)
            target = UserPlans.objects.get(plan_id=plan_id, user_id=participant_id)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if who_delete.role in ['admin', 'elder']:  # удаляющий должен иметь право на удаление
            if target.role != 'elder':             # удалить старосту должно быть невозможно!
                target.delete()
            else:
                return HttpResponse(status=406)
        else:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def change_role(request):
    """
        On client side use:
            URL: /change_role,
            data: plan_id <int>, participant_id <int>, new_role <str>
            method: POST
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.POST

        try:
            plan_id = int(data['plan_id'])
            participant_id = int(data['participant_id'])
            new_role = data['new_role']
            who_changes = UserPlans.objects.get(user_id=user.id, plan_id=plan_id)
            who_is_changed = UserPlans.objects.get(user_id=participant_id, plan_id=plan_id)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if new_role in ['participant', 'admin']:

            if who_changes.role in ['elder', 'admin']:  # если тот, кто меняет роль имеет на это право

                if who_is_changed.role != 'elder':      # если тот, кому меняют роль не является старостой
                    who_is_changed.role = new_role
                    who_is_changed.save()
                else:
                    return HttpResponse(status=403)
            else:
                return HttpResponse(status=403)
        else:
            return HttpResponse(status=400)

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

