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
from django.shortcuts import render_to_response
from django.http import HttpResponse
from datetime import datetime
from django.utils import timezone


class PlanSettings():
    """
        Класс предназначен, для реализации функционала настроек расписания.
        Основные функции:
            1. delete_plan;
        1 - Если пользователь, удаляющий расписание, просто подписан на данное расписание, то
        из базы удаляется запись в таблице user_plans, связывающая данного юзера и данное расписание
        Если пользователь, удаляющий расписание - создатель данного расписания, то из базы удаляется
        абсолютно вся информация об этом расписании. Т.е. чистятся все записи, в которых данное
        расписание фигурирует как форин кей.
    """
    def __init__(self, user_id, plan_id):
        self.user_id = user_id
        self.plan_id = plan_id

    def delete_plan(self):
        plan = PlanLists.objects.filter(id=self.plan_id)
        plan = plan[0]

        if plan.owner_id == self.user_id:  # если user, удаляющий расп. - создатель
            # прощальное сообщение
            farewell_message = "Староста удалил это расписание.\n" \
                               "Данное расписание будет удалено из Вашего списка расписаний."

            # mailing = IntodayerMailing(
            #     self.user_id,
            #     self.plan_id,
            #     text=farewell_message,
            # )
            # # совершаем рассылку
            # mailing.send()

            # удаляем расписание из plan_list, после этого в базе сработает триггер,
            # который удалит всю существующую инфу. о данном расписании в базе.
            plan.delete()
        else:
            user_plan_row = UserPlans.objects.get(user_id=self.user_id, plan_id=self.plan_id)
            # удаляем только строчку в user_plans
            user_plan_row.delete()


def create_plan(request):
    """
        On client side use:
            URL: /create_new_plan,
            method: POST
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        user.add_new_plan()
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def delete_plan(request):
    """
        On client side use:
            URL: /delete_plan,
            data: plan_id <int>
            method: POST
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)

        try:
            plan_id = int(request.POST['plan_id'])
            UserPlans.objects.get(user_id=user.id, plan_id=plan_id)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        settings = PlanSettings(user.id, plan_id)
        settings.delete_plan()

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def update_plan_info(request):
    """
        On client side use:
            URL: /update_plan_info,
            data: plan_id <str>, date <str> (day.month.year)
            method: POST
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.POST

        try:
            plan_id = int(data['plan_id'])
            date = timezone.datetime.strptime(data['start_date'], '%d.%m.%Y')
            UserPlans.objects.get(user_id=user.id, plan_id=plan_id)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        plan = PlanLists.objects.get(id=plan_id)

        if plan.owner == user:
            plan.title = data['new_title']
            plan.start_date = date
            plan.save()
        else:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def get_drop_list_ajax(request):
    """
        Функция собирает в html список все доступные для текущего пользователя
        элементы из таблицы. Имя таблицы задано в data['model']
        On client side use:
            URL: /get_drop_list,
            data: plan_id <int>, model <str>
            method: GET
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.GET
        context = {'is_error': False}

        try:
            plan_id = int(data['plan_id'])
            plan = UserPlans.objects.select_related().get(user_id=user.id, plan_id=plan_id)
        except ValueError:
            return render_to_response('templates_for_ajax/drop_list_tmp.html', {'is_error': True}, status=400)
        except ObjectDoesNotExist:
            return render_to_response('templates_for_ajax/drop_list_tmp.html', {'is_error': True}, status=403)

        if data['model'] == 'time':
            context['time_list'] = Times.objects.filter(plan_id=plan.plan.id).order_by('hh24mm')

        elif data['model'] == 'subject':
            context['subject_list'] = Subjects.objects.filter(plan_id=plan.plan.id).order_by('name')

        elif data['model'] == 'teacher':
            context['teacher_list'] = Teachers.objects.filter(plan_id=plan.plan.id).order_by('name_short')

        elif data['model'] == 'place':
            context['place_list'] = Places.objects.filter(plan_id=plan.plan.id).order_by('name')

        return render_to_response('templates_for_ajax/drop_list_tmp.html', context, status=200)
    else:
        return HttpResponse(status=401)
