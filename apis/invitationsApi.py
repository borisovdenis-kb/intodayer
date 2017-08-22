# -*- coding: utf-8 -*-

from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.core.exceptions import ObjectDoesNotExist
from intodayer2_app.models import Invitations, CustomUser


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
            return render_to_response("confirm_invitation.html")
    else:
        request.session['state'] = {'operation': 'confirm_invitation', 'uuid': uuid}
        return HttpResponseRedirect("/")
