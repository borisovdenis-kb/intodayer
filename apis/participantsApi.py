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


def delete_partie(request):
    """
        On client side use:
            URL: /delete_partie,
            data: plan_id <int>, partie_id <int>
            method: POST
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.POST

        try:
            plan_id = int(data['plan_id'])
            partie_id = int(data['partie_id'])
            PlanLists.objects.get(id=plan_id, owner_id=user.id)  # удаляющий должен быть владельцем расп.
            UserPlans.objects.get(plan_id=plan_id, user_id=partie_id).delete()
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)

