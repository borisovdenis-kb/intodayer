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


def delete_member(request):
    if not request.is_ajax():
        return HttpResponse(status=400)

    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)

        try:
            plan_id = request.POST['plan_id']
            partie_id = request.POST['partie_id']
        except ValueError:
            return HttpResponse(status=400)

        try:
            # user, удаляющий расп. должен быть владельцем этого расписания
            PlanLists.objects.get(id=plan_id, owner_id=user.id)
            user_plan = UserPlans.objects.get(plan_id=plan_id, user_id=partie_id)
        except ObjectDoesNotExist:
            return HttpResponse(status=400)
        else:
            user_plan.delete()

        return HttpResponse(status=200)

    else:
        return HttpResponse(status=401)
