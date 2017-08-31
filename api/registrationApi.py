# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django
from intodayer2 import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------

import hmac
import hashlib
from extra.mailing import IntodayerMailing
from django.template.loader import get_template
from intodayer2_app.models import EmailActivation


def generate_activation_key(email):
    res = hmac.new(bytearray('signature', 'utf-8'), bytearray(email, 'utf-8'), hashlib.sha256)
    activation_key = res.hexdigest()

    return activation_key


def send_activation_link(email, activation_key):
    context = {}

    if settings.DEBUG:
        context['link'] = "http://127.0.0.1:8000/activate/{}".format(activation_key)
    else:
        context['link'] = "http://intodayer.ru/activate/{}".format(activation_key)

    content = get_template('emails/email_activation.html').render(context)

    mailing = IntodayerMailing(content=content, subject="Email activation", _type="text/html")
    mailing.send_via_email([email])


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
