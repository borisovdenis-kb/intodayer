# -*- coding: utf-8 -*-

import os
import json
import sendgrid
from uuid import uuid4
from decouple import config
from base64 import b64decode
from intodayer_bot import bot
from intodayer2 import settings
from urllib.error import URLError
from django.db.utils import IntegrityError
from django.core.files.base import ContentFile
from django.template.loader import get_template
from python_http_client.exceptions import BadRequestsError
from intodayer2_app.models import UserMailingChannels, DivToPng, CustomUser, Invitations


class IntodayerMailing:
    def __init__(self, content='None', _type="text/plain", subject='None', image=None):
        """
        :param _type: text/plain, text/html, ...
        :param content: some string
        :param subject: some string
        :param image: path to image file or string in base64
        """
        self.type = _type
        self.content = content
        self.subject = subject
        self.sg = sendgrid.SendGridAPIClient(apikey=config('SENDGRID_API_KEY'))

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
            'message': {'text': self.content, 'image': self.image},
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
        recipient_list = [{"email": email} for email in recipient_list]
        data = {
            "personalizations": [
                {
                    "to": recipient_list,
                    "subject": self.subject
                }
            ],
            "from": {
                "email": config('PROJECT_EMAIL')
            },
            "content": [
                {
                    "type": self.type,
                    "value": self.content
                }
            ]
        }
        response = self.sg.client.mail.send.post(request_body=data)

    def send_invitations_via_email(self, recipient_list, from_user, plan_id):
        mailing_states = {}
        context = {
            'from_user': from_user,
        }

        for email in recipient_list:
            uuid = str(uuid4())

            if settings.DEBUG:
                context['link'] = "http://127.0.0.1:8000/invitation/{}".format(uuid)
            else:
                context['link'] = "http://intodayer.ru/invitation/{}".format(uuid)

            self.content = get_template('emails/invitation.html').render(context)

            try:
                self.send_via_email([email])
            except (BadRequestsError, URLError):
                mailing_states[email] = 'sending error'
                continue

            to_user = CustomUser.objects.filter(email=email)
            to_user = to_user[0] if to_user else None
            try:
                if to_user != from_user:
                    Invitations.objects.create(
                        from_user=from_user, to_user=to_user, email=email, plan_id=plan_id, uuid=uuid
                    )
                else:
                    mailing_states[email] = 'can not invite yourself'
                    continue
            except IntegrityError:
                mailing_states[email] = 'already_invited'
                continue

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
    recipient_email = ["borisovdenis-kb@yandex.ru"]
    user = CustomUser.objects.get(id=5)

    Z = IntodayerMailing(_type="text/html")
    res = Z.send_invitations_via_email(recipient_email, user, 322)

    print(res)
