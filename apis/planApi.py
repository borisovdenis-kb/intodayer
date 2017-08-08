# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
import json
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from extra.mailing import IntodayerMailing
from django.shortcuts import render_to_response
from django.http import JsonResponse, HttpResponse
from intodayer2_app.models import (
    CustomUser, UserPlans, Times, Subjects, Teachers, Places, PlanLists
)


def create_plan(request):
    """
        This endpoint to create plan for user.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        new_plan = user.add_new_plan()

        return JsonResponse({'new_plan_id': new_plan.id}, status=200)
    else:
        return HttpResponse(status=401)


def delete_plan(request):
    """
        This endpoint to delete plan from plan_lists.
        All information in DB related to this plan also will be deleted.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = json.loads(request.body)

        try:
            action_is_available = user.has_rights(action='delete_plan', **data)
        except (ValueError, ValidationError):
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if action_is_available:
            PlanLists.objects.get(id=data['plan_id']).delete()
            # plan.delete_with_message(message='Some message')
        else:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def update_plan_info(request):
    """
        This endpoint to update plan information.
        Information such as:
            - title
            - start_date

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = json.loads(request.body)

        try:
            if user.has_rights(action='edit_plan', **data):
                PlanLists.objects.get(id=data['plan_id']).update(**data['plan_info'])
            else:
                return HttpResponse(status=403)
        except (ValidationError, ValueError):
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def get_drop_list(request):
    """
        This endpoint to get list of objects related with some plan.
        Objects such as:
            Teachers
            Subjects
            Times
            Places

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = json.loads(request.body)
        context = {'is_error': False}

        try:
            plan = UserPlans.objects.select_related().get(user_id=user.id, plan_id=data['plan_id'])
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
        This endpoint to set avatar to some plan.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = request.POST

        try:
            params = {'plan_id': data['plan_id']}
            if user.has_rights(action='edit_plan', **params):
                plan = PlanLists.objects.get(id=data['plan_id'])
                # удаляем предыдущую аватарку
                plan.avatar.delete()
                # сохраняем новую
                plan.update(**{'avatar': request.FILES['avatar']})
            else:
                return HttpResponse(status=403)

        except (ValueError, ValidationError):
            return HttpResponse(status=200)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def mailing_test(request):
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        data = json.loads(request.body)

        try:
            mailing = IntodayerMailing(text=data['text'], image=data['image'])
            mailing.send_by_plan(plan_id=data['plan_id'])
        except ValueError:
            return HttpResponse(status=400)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=403)
