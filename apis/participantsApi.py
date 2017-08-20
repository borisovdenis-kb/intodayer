# -*- coding: utf-8 -*-

import json
# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from extra.mailing import IntodayerMailing
from intodayer2_app.views import get_participants
from django.shortcuts import render_to_response
from django.http import HttpResponse, JsonResponse
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from intodayer2_app.models import CustomUser, UserPlans, Invitations, UnacceptableNewRoleValue

# TODO: Заняться оптимизацией запросов!!!


def delete_participant(request):
    """
        This endpoint to delete participant from some plan.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = json.loads(request.body.decode('utf-8'))

        try:
            if user.has_rights(action='delete_participant', **data):
                participant = UserPlans.objects.get(plan_id=data['plan_id'], user_id=data['participant_id'])
                participant.delete()
            else:
                return HttpResponse(status=403)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def set_role(request):
    """
        This endpoint to change role of participant in some plan.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = json.loads(request.body.decode('utf-8'))

        try:
            if user.has_rights(action='set_role', **data):
                participant = UserPlans.objects.get(user_id=data['participant_id'], plan_id=data['plan_id'])
                participant.update(**{'role': data['new_role']})
            else:
                return HttpResponse(status=403)
        except (ValueError, ValidationError):
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)
        except UnacceptableNewRoleValue:
            return HttpResponse(status=406)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def invite_participants(request):
    """
        This endpoint to invite participants by the email to some plan.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = json.loads(request.body.decode('utf-8'))

        try:
            email_list = data['email_list']
            params = {'plan_id': data['plan_id']}
            action_is_available = user.has_rights(action='invite_participants', **params)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if action_is_available:
            mailing = IntodayerMailing()
            invitation_states = mailing.send_invitations_via_email(email_list, user, data['plan_id'])
            return JsonResponse({'invitation_states': invitation_states})
        else:
            return HttpResponse(status=403)
    else:
        return HttpResponse(status=401)


def check_email(request):
    """
        This endpoint to check email that user trying to invite.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = json.loads(request.body.decode('utf-8'))

        if Invitations.objects.filter(email=data['email']):
            return JsonResponse({'state': 'already_invited'})

        try:
            checked_user = CustomUser.objects.get(email=data['email'])

            if UserPlans.objects.filter(user_id=checked_user.id, plan_id=data['plan_id']):
                return JsonResponse({'state': 'already_joined'})
        except ObjectDoesNotExist:
            return JsonResponse({'state': 'ok'})

        return JsonResponse({'state': 'ok'})
    else:
        return HttpResponse(status=401)


def get_expected_participants(request):
    """
        This endpoint to get participants which was invited in some plan, 
        but they din't confirmed invitation yet.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = request.GET

        try:
            UserPlans.objects.get(
                plan_id=data['plan_id'],
                user_id=user.id,
                role__in=['admin', 'elder']
            )

            expected_participants = list(
                Invitations.objects.filter(plan_id=data['plan_id']).values('email')
            )
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        return JsonResponse({'expected_participants': expected_participants}, status=200)
    else:
        return HttpResponse(status=401)


def switch_plan_participants(request):
    """
        I don't sure that this is RESTfull endpoint...

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = request.POST
        context = {}

        try:
            plan = UserPlans.objects.select_related().get(plan_id=data['plan_id'], user_id=user.id)
            context['cur_plan'] = plan
            context.update(get_participants(plan))
        except ValueError:
            return render_to_response('templates_for_ajax/content_errors.html', status=400)
        except ObjectDoesNotExist:
            return render_to_response('templates_for_ajax/content_errors.html', status=403)

        # устанавливаем current_yn
        user.set_current_plan(data['plan_id'])

        return render_to_response('content_pages/right_content_participants.html', context, status=200)
    else:
        return HttpResponse(status=401)
