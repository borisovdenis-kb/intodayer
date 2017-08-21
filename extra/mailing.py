# -*- coding: utf-8 -*-

import json
# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django
from django.template.loader import get_template

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from uuid import uuid4
from decouple import config
from base64 import b64decode
from intodayer_bot import bot
from django.core.mail import send_mail
from django.core.files.base import ContentFile
from extra.validators import validate_email_field
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from intodayer2_app.models import UserMailingChannels, DivToPng, CustomUser, Invitations


class IntodayerMailing:
    def __init__(self, text='', subject=None, image=None):
        """
        :param text: some string
        :param subject: some string
        :param image: path to image file or string in base64
        """
        self.text = text
        self.subject = subject

        if image:
            if os.path.exists(image):
                # либо image - путь к файлу
                self.image = image
            else:
                # либо image - base64 str, тогда сохраняем это изображение
                self.image = IntodayerMailing.save_image_png(image)
        else:
            self.image = image

    def send_via_telegram(self, recipient_list):
        """
            Sends the message that was set when the instance was created 
            via telegram to all chat_id in recipient_list.
            :param recipient_list: [828399002, ...]
        """
        mailing_attrs = {
            'message': {'text': self.text, 'image': self.image},
            'recipient_list': recipient_list
        }

        mailing_attrs = json.dumps(mailing_attrs, ensure_ascii=False, indent=2)

        bot.do_mailing(mailing_attrs)

    def send_via_email(self, recipient_list):
        """
            Sends the message that was set when the instance was created 
            via email to all email in recipient_list.
            :param recipient_list: [some@email.com, ...]
        """
        send_mail(
            self.subject, self.text, config('PROJECT_EMAIL'), recipient_list, fail_silently=False
        )

    def send_invitations_via_email(self, recipient_list, from_user, plan_id):
        mailing_states = {}
        context = {
            'from_user': from_user,
        }

        # email validation
        for email in recipient_list:
            try:
                validate_email_field(email)
            except ValidationError:
                recipient_list.remove(email)
                mailing_states[email] = 'validation error'

        for email in recipient_list:
            uuid = str(uuid4())

            try:
                to_user = CustomUser.objects.get(email=email)
            except ObjectDoesNotExist:
                Invitations.objects.create(
                    from_user=from_user, email=email, plan_id=plan_id, uuid=uuid
                )
            else:
                Invitations.objects.create(
                    from_user=from_user, to_user=to_user, email=email, plan_id=plan_id, uuid=uuid
                )

            # TODO: Изменить на боевом серерве
            context['url'] = "http://127.0.0.1:8000/invitation/{}".format(uuid)

            send_mail(
                self.subject,
                self.text,
                config('PROJECT_EMAIL'),
                [email],
                fail_silently=False,
                html_message=get_template('emails/invitation.html').render(context)
            )

            mailing_states[email] = 'ok'

        return mailing_states

    def send_by_plan(self, plan_id):
        """
            Sends the message that was set when the instance was created 
            via all channels to all users in plan
            :param plan_id: <int>
        """
        telegram_recipients = UserMailingChannels.get_telegram_recipients(plan_id)
        email_recipients = UserMailingChannels.get_email_recipients(plan_id)

        self.send_via_telegram(telegram_recipients)
        self.send_via_email(email_recipients)

    @staticmethod
    def save_image_png(image):
        miss_pad = len(image) % 4  # add missing padding

        if miss_pad != 0:
            image += '=' * (4 - miss_pad)

        image = image.split('base64,')[1]

        img_data = b64decode(image)
        filename = '%s.png' % hash(image)
        image = ContentFile(img_data, filename)

        new_img = DivToPng(image=image)
        new_img.save()

        return new_img.image.path


if __name__ == '__main__':
    recipient_email = ['borisovdenis-kb@yandex.ru']
    user = CustomUser.objects.get(id=4)

    Z = IntodayerMailing()
    res = Z.send_invitations_via_email(recipient_email, user, 300)

    print(res)
