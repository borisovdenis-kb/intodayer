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
from django.http import HttpResponse, HttpResponseRedirect


def verify_invitation(request, uuid):
    """
        This endpoint to check existence of invitation.

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
            url = "/confirm_invitation/{}/{}/{}/".format(
                invitation.from_user.id, invitation.to_user.id, invitation.plan_id
            )
            return HttpResponseRedirect(url)
    else:
        request.session['state'] = {'operation': 'confirm_invitation', 'uuid': uuid}
        return HttpResponseRedirect("/")


def confirm_invitation_view(request, from_user_id, to_user_id, plan_id):
    if request.user.is_authenticated():
        try:
            invitation = Invitations.objects.get(from_user=from_user_id, to_user=to_user_id, plan_id=plan_id)
        except ObjectDoesNotExist:
            return render_to_response("errors/invitation_is_not_valid.html")
        else:
            # TODO: Нужно выдать страничку с подтверждением или отклонение расписания.
            return render_to_response("confirm_invitation.html")
    else:
        return HttpResponse(status=401)
