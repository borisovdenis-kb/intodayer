import json
# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from intodayer_bot import bot
from django.core.mail import send_mail


FROM_EMAIL = 'intodayer@yandex.ru'


class NotEnoughRecipients(Exception):
    pass


class IntodayerMailing:
    def __init__(self, recipient_list, subject='', text='', image=None):
        """
        :param recipient_list: list of email or telegram chat id or user objects
        :param text: some string
        :param image: path to image file
        """
        self.subject = subject
        self.image = image
        self.text = text

        if len(recipient_list) >= 1:
            self.recipient_list = recipient_list
        else:
            raise NotEnoughRecipients


class TelegramMailing(IntodayerMailing):
    def mass_mailing(self):
        """
            Совершает рассылку через telegram бота
            По всем chat_id в recipient_list
        """
        mailing_attrs = {
            'message': {'text': self.text, 'image': self.image},
            'recipient_list': self.recipient_list
        }

        mailing_attrs = json.dumps(mailing_attrs, ensure_ascii=False, indent=2)

        bot.do_mailing(mailing_attrs)


class EmailMailing(IntodayerMailing):
    def mass_mailing(self):
        """
            Совершает рассылку через электронную почту
            По всем email в recipient_list
        """
        send_mail(
            self.subject,
            self.text,
            FROM_EMAIL,
            self.recipient_list,
            fail_silently=False
        )


if __name__ == '__main__':
    recipient_telegram = ['322530729']
    recipient_email = ['maxim.semyanov@mail.ru']
    image = r'C:\Users\Denis\Desktop\Новый принт\02_nwa_color_onfence_rt.jpg'

    # X = TelegramMailing(recipient_telegram, text='popa', image=image)
    # X.mass_mailing()

    Y = EmailMailing(recipient_email, text='popa')
    Y.mass_mailing()
