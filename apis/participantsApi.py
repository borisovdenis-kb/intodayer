#                                                МАТRIX OF RIGHTS
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+----------+
# |       | edit plan | leave plan | del plan | invite part | del part | del admin | del elder | set role |
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+----------+
# | elder |     1     |      0     |     1    |      1      |     1    |     1     |     0     |     1    |
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+----------+
# | admin |     1     |      1     |     0    |      1      |     1    |     1     |     0     |     1    |
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+----------+
# | part  |     0     |      1     |     0    |      0      |     0    |     0     |     0     |     0    |
# +-------+-----------+------------+----------+-------------+----------+-----------+-----------+----------+
# P.S. in the REST API del participant and del admin union into one action
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
from django.db.utils import IntegrityError
from intodayer2_app.models import *
from intodayer2_app.views import *
from extra.mailing_api import *
from django.http import HttpResponse
from extra.mailing import EmailMailing, NotEnoughRecipients
from extra.mailing_messages import invitation_message
from django.core import serializers

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

            params = {'plan_id': plan_id, 'participant_id': participant_id}
            action_is_available = user.has_rights(action='delete_participant', **params)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if action_is_available:
            participant = UserPlans.objects.get(plan_id=plan_id, user_id=participant_id)
            participant.delete()
        else:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def set_role(request):
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
            new_role = UserPlans.validate_role(data['new_role'])

            params = {'plan_id': plan_id, 'participant_id': participant_id, 'new_role': new_role}
            action_is_available = user.has_rights(action='set_role', **params)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)
        except UnacceptableNewRoleValue:
            return HttpResponse(status=406)

        if action_is_available:
            participant = UserPlans.objects.get(user_id=participant_id, plan_id=plan_id)
            participant.role = new_role
            participant.save()
        else:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def invite_participants(request):
    """
        On client side use:
            URL: /invite_participants,
            data: plan_id <int>, email_list <list>[<str>, ...]
            method: POST
        example:
            data: {plan_id: 244, email_list: ['aelegend@rambler.ru', 'borisovdenis-kp@yandex.ru]}
        :return:
            invitations_states: <list>[{'email': <str>, 'state': <str>}, ...]
            available states
            (
                'already_joined', 'already_invited', 'invitation_sent'
            )
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        response = HttpResponse(status=200)
        response['Content-Type'] = 'application/json'
        data = request.POST

        try:
            plan_id = int(data['plan_id'])
            email_list = json.loads(data['email_list'])

            params = {'plan_id': plan_id}
            action_is_available = user.has_rights(action='invite_participants', **params)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if action_is_available:
            invitations_states = []
            for_mailing = []

            for email in email_list:
                try:
                    _user = CustomUser.objects.get(email=email)
                except ObjectDoesNotExist:
                    # пользователя не существует
                    if not Invitations.objects.filter(plan_id=plan_id, email=email):
                        # пользователь не приглашен
                        Invitations.objects.create(from_user=user, plan_id=plan_id, email=email)
                        invitations_states.append({'email': email, 'state': 'invitation_sent'})
                        for_mailing.append(email)
                    else:
                        invitations_states.append({'email': email, 'state': 'already_invited'})

                    continue

                if not UserPlans.objects.filter(plan_id=plan_id, user_id=_user.id):
                    # если пользователь не присоединился
                    if not Invitations.objects.filter(plan_id=plan_id, email=email):
                        # если пользователь не приглашен
                        Invitations.objects.create(from_user=user, plan_id=plan_id,  to_user=_user, email=email)
                        invitations_states.append({'email': email, 'state': 'invitation_sent'})
                        for_mailing.append(email)
                    else:
                        invitations_states.append({'email': email, 'state': 'already_invited'})
                else:
                    invitations_states.append({'email': email, 'state': 'already_joined'})

            # TODO: тут должна быть рассылка общего вида

            response.write(json.dumps({'invitation_states': invitations_states}))

            return response
        else:
            return HttpResponse(status=403)
    else:
        return HttpResponse(status=401)


def get_expected_participants(request):
    """
        On client side use:
            URL: /get_expected_participants,
            data: plan_id <int>
            method: GET
        :return: 
            expected_participants: <list>[{'email': <str>}, ...]
        example:
            {
                "expected_participants": [{"email": "borisovdenis-kb@yandex.ru"}]
            }
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        response = HttpResponse(status=200)
        response['Content-Type'] = 'application/json'
        data = request.GET

        try:
            plan_id = int(data['plan_id'])
            UserPlans.objects.get(plan_id=plan_id, user_id=user.id)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        expected_participants = list(Invitations.objects.filter(plan_id=plan_id).values('email'))

        response.write(json.dumps({'expected_participants': expected_participants}))

        return response
