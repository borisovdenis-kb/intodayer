# -*- coding: utf-8 -*-

import json
from extra.mailing import IntodayerMailing
from django.shortcuts import render_to_response
from intodayer2_app.views import get_participants
from django.http import HttpResponse, JsonResponse
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from intodayer2_app.models import CustomUser, UserPlans, Invitations, UnacceptableNewRoleValue

from intodayer2_app.views import get_user_participant_rights

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
            email_list = list(set(data['email_list']))
            params = {'plan_id': data['plan_id']}
            action_is_available = user.has_rights(action='invite_participants', **params)
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if action_is_available:
            mailing = IntodayerMailing(_type="text/html")
            invitation_states = mailing.send_invitations_via_email(email_list, user, data['plan_id'])
            return JsonResponse({'invitation_states': invitation_states})
        else:
            return HttpResponse(status=403)
    else:
        return HttpResponse(status=401)


def cancel_invitation(request):
    """
        This endpoint to cancel invitation, that was sent to incorrect email or 
        to user that inviter don't want to invite.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = json.loads(request.body.decode('utf-8'))

        try:
            action_is_available = user.has_rights(action='edit_plan', **{'plan_id': data['plan_id']})
        except ValueError:
            return HttpResponse(status=400)
        except ObjectDoesNotExist:
            return HttpResponse(status=403)

        if action_is_available:
            try:
                Invitations.objects.get(id=data['invitation_id']).delete()
            except ObjectDoesNotExist:
                return HttpResponse(status=400)
        else:
            return HttpResponse(status=403)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def check_email_not_invited(request):
    """
        This endpoint to check email that user trying to invite.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        data = json.loads(request.body.decode('utf-8'))

        try:
            if Invitations.objects.filter(email=data['email'], plan_id=data['plan_id']):
                return JsonResponse({'state': 'already_invited'})

            checked_user = CustomUser.objects.get(email=data['email'])
            if UserPlans.objects.filter(user_id=checked_user.id, plan_id=data['plan_id']):
                return JsonResponse({'state': 'already_joined'})

        except ValueError:
            return HttpResponse(status=400)
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
                Invitations.objects.filter(plan_id=data['plan_id']).values('id', 'email')
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

        user.set_current_plan(data['plan_id'])

        context['this_user'] = request.user
        context.update(get_user_participant_rights(request.user, context['cur_plan'].plan.id))

        return render_to_response('content_pages/right_content_participants.html', context, status=200)
    else:
        return HttpResponse(status=401)
