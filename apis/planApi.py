# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
import json
from django.core.exceptions import ObjectDoesNotExist
from extra.mailing import IntodayerMailing, PlanLists
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.utils import timezone
from intodayer2_app.models import (
    CustomUser, UserPlans, Times, Subjects, Teachers, Places
)


def create_plan(request):
    """
        On client side use:
            URL: /create_new_plan,
            method: POST
        return: {new_plan_id: <int>}
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        response = HttpResponse(status=200)
        response['Content-Type'] = 'application/json'

        new_plan = user.add_new_plan()

        response.write(json.dumps({'new_plan_id': new_plan.id}))

        return response
    else:
        return HttpResponse(status=401)


def delete_plan(request):
    """
        This controller delete plan from PlanLists.
        On client side use:
            URL: /delete_plan,
            data: plan_id <int>
            method: POST
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.POST

        try:
            plan_id = int(data['plan_id'])

            params = {'plan_id': plan_id}
            action_is_available = user.has_rights(action='delete_plan', **params)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if action_is_available:
            plan = PlanLists.objects.get(id=plan_id)
            # plan.delete_with_message(message='Some message')
            plan.delete()
        else:
            return HttpResponse(status=403)

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

            params = {'plan_id': plan_id}
            action_is_available = user.has_rights(action='edit_plan', **params)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if action_is_available:
            plan = PlanLists.objects.get(id=plan_id)
            plan.update(**{'start_date': date, 'title': data['new_title']})
        else:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def get_drop_list(request):
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
        data = request.POST
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


def upload_plan_avatar(request):
    """
        On client side use:
            URL: /upload_plan_avatar,
            data: plan_id <int>, avatar <file>
            method: GET
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.POST

        try:
            plan_id = int(data['plan_id'])

            params = {'plan_id': plan_id}
            action_is_available = user.has_rights(action='edit_plan', **params)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if action_is_available:
            plan = PlanLists.objects.get(id=plan_id)
            plan.avatar.delete()                                # удаляем предыдущую аватарку
            plan.update(**{'avatar': request.FILES['avatar']})  # сохраняем новую

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def mailing_test(request):
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.POST

        try:
            plan_id = int(data['plan_id'])
        except ValueError:
            return HttpResponse(status=400)

        mailing = IntodayerMailing(text='TEST')
        mailing.send_by_plan(plan_id=plan_id)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=403)
