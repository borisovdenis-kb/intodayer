# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

from intodayer2 import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------

import hmac
import hashlib
from extra.mailing import IntodayerMailing
from django.template.loader import get_template
# from intodayer2_app.models import CustomUser, EmailActivation


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

    content = get_template('emails/invitation.html').render(context)

    mailing = IntodayerMailing(content=content)
    mailing.send_via_email([email])


if __name__ == "__main__":
    send_activation_link("borisovdenis-kb@yandex.ru")
