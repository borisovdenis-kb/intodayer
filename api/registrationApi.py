# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django
from django.template.loader import get_template

from extra.mailing import IntodayerMailing
from intodayer2 import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------

from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect, HttpResponse
from intodayer2_app.models import EmailActivation, CustomUser, ToManyRequests


def send_activation_link(email, activation_key):
    context = {}

    if settings.DEBUG:
        context['link'] = "http://127.0.0.1:8000/activate/{}".format(activation_key)
    else:
        context['link'] = "http://intodayer.ru/activate/{}".format(activation_key)

    content = get_template('emails/email_activation.html').render(context)

    mailing = IntodayerMailing(content=content, subject="Email activation", _type="text/html")
    mailing.send_via_email([email])


def repeat_activation(request):
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)
        activation_key = EmailActivation.generate_activation_key(user.email)

        try:
            new_user_activation = EmailActivation.bind_user_and_activation_key(user, activation_key)
        except ToManyRequests:
            return HttpResponse(status=403)
        else:
            send_activation_link(
                new_user_activation.user.email,
                new_user_activation.activation_key
            )
            return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


def activate_email(request, activation_key):
    try:
        user_activation = EmailActivation.objects.get(activation_key=activation_key)
    except ObjectDoesNotExist:
        return HttpResponseRedirect("/login")
    else:
        user_activation.delete()
        if not user_activation.user_id:
            return HttpResponseRedirect("/registration/activation_is_expire")
        else:
            return HttpResponseRedirect("/home/success_activation")
