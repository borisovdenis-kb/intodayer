# -*- coding: utf-8 -*-

from datetime import datetime
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.core.exceptions import ObjectDoesNotExist
from intodayer2_app.models import Invitations, CustomUser, PlanLists, PlanRows, DaysOfWeek


def get_plan(plan_id):
    context = dict()
    context['cur_plan'] = PlanLists.objects.get(id=plan_id)
    plan_rows = PlanRows.objects.select_related().filter(plan_id=plan_id).order_by('time')
    context['plan_rows'] = plan_rows

    return context


def get_dates_info(cur_plan):
    context = dict()
    day_of_weeks = DaysOfWeek.objects.all()
    this_start_date = cur_plan.start_date
    this_start_date = datetime.strftime(this_start_date, "%d.%m.%Y")
    context['day_of_weeks'] = day_of_weeks
    context['start_date'] = this_start_date

    return context


def confirm_invitation(request, uuid):
    """
        This endpoint to confirm invitation.

        --> For more detailed documentation see Postman.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)

        try:
            invitation = Invitations.objects.get(uuid=uuid, email=user.email)
            invitation.update(**{'to_user': user})
        except ObjectDoesNotExist:
            return render_to_response("errors/invitation_is_not_valid.html")
        else:
            context = get_plan(invitation.plan_id)
            context.update(get_dates_info(context['cur_plan']))
            return render_to_response("confirm_invitation.html", context)
    else:
        request.session['state'] = {'operation': 'confirm_invitation', 'uuid': uuid}
        return HttpResponseRedirect("/")
