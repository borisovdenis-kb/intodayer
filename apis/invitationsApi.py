# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django
from django.shortcuts import render_to_response

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from intodayer2_app.models import Invitations, CustomUser
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect


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
