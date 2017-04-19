import json
from extra import utils
from intodayer2_app.models import *
from intodayer_bot.bot import do_mailing
from django.core.mail import EmailMessage
from django.core.mail import send_mail


FROM_EMAIL = 'intodayer@yandex.ru'


class IntodayerMailing:
    """
        Класс предназначен, для осуществления рассылки.
        Три главные функции:
            1. do_telegram_mailing;
            2. do_email_mailing.
            3. send
        1 - Вызывает метод do_mailing из модуля intodayer_bot.bot, 
        передавая ему собранные в JSON параметры для отправки. 
        В телеграмме будет оповещены только те, кто добавил себе нашего бота.
        2 - Совершает рассылку на электронную почту всем тем, кто не добавил себе бота.
        3 - Вызывает внутри себя функции 1, 2.
    """

    def __init__(self, sender_id, plan_id, image=None, text=None):
        """
            message - словарь в который будет собираться
            вся необходимая боту информация для рассылки
            :param sender_id:
            :param text:
        """
        # все данные будут собирать в этот словарь
        self.message = {}
        self.msg_text = text
        self.plan_id = plan_id
        self.sender_id = sender_id

        # add missing padding
        miss_pad = len(image) % 4
        if miss_pad != 0:
            image += '=' * (4 - miss_pad)

        self.image = image.split('base64,')[1]

    def set_sender_name(self):
        """
            Функция добавляет в словарь message имя
            того, кто делает рассылку. Либо username,
            либо first_name last_name, если они есть.
            :return:
        """
        sender = CustomUser.objects.get(id=self.sender_id)
        name = ' '.join(sender.get_name())
        self.message['sender_name'] = name

    def set_recipients(self):
        """
            Собирает получаетлей для рассылки на почту
            и получателей в телеграме.
            :return:
        """
        self.message['recipients_telegram'] = []
        self.message['recipients_email'] = []

        recp_list = list(UserPlans.objects.select_related().filter(plan_id=self.plan_id))

        for user in recp_list:
            if user.user.chat_id:
                self.message['recipients_telegram'].append({
                    'chat_id': user.user.chat_id,
                    'name': ' '.join(user.user.get_name())
                })
            elif user.user.email and not user.user.chat_id:
                self.message['recipients_email'].append(user.user.email)

    def set_msg_text(self):
        self.message['text'] = self.msg_text

    def set_msg_image(self):
        filename = '%s_%s.png' % (self.sender_id, self.plan_id)
        img = utils.save_div_png(self.image, filename)

        self.message['image'] = img

    def set_plan_info(self):
        """
            Собирает информацию об расписания, от которого идет рассылка.
            :return:
        """
        count = UserPlans.objects.select_related().filter(plan_id=self.plan_id).count()
        plan = PlanLists.objects.get(id=self.plan_id)

        self.message['plan_info'] = {'title': plan.title, 'desc': plan.description}
        self.message['plan_info'].update({'mem_count': str(count)})

    def get_mailing_param(self):
        """
            Функция собирает все данные вместе.
            Все записывается в словарь message.
            Затем возвращает объект в формате JSON.
            :return: JSON string
        """
        self.set_sender_name()
        self.set_recipients()
        self.set_msg_text()

        if self.image:
            self.set_msg_image()

        self.set_plan_info()

        return json.dumps(self.message, ensure_ascii=False, indent=2)

    def do_email_mailing(self, mail_param):
        try:
            data = json.loads(mail_param)
        except ValueError:
            raise ValueError('Send JSON string')
        except TypeError:
            raise TypeError('Send JSON string')

        message_text = ''
        unknown = '- ? -' + '\n'
        subject = 'Новости расписания '
        recp_list = []

        if data['plan_info']['title']:
            message_text += 'Расписание: ' + data['plan_info']['title'] + '\n'
            subject += data['plan_info']['title']
        else:
            message_text += 'Расписание: ' + unknown
            subject += unknown

        if data['plan_info']['mem_count']:
            message_text += 'Количество участников: ' + data['plan_info']['mem_count'] + '\n'
        else:
            message_text += 'Количество участников: ' + unknown

        if data['sender_name']:
            message_text += 'Староста: ' + data['sender_name'] + '\n'
        else:
            message_text += 'Староста: ' + unknown

        if data['text']:
            message_text += '\n' + '"' + data['text'] + '"' + '\n'
        else:
            message_text += '\n' + '[Пустое сообщение]' + '\n'

        if data['recipients_email']:
            print(data['recipients_email'])
            recp_list = data['recipients_email']

        send_mail(
            subject,
            message_text,
            FROM_EMAIL,
            recp_list,
            fail_silently=False
        )

    def do_telegram_mailing(self, mail_param):
        do_mailing(mail_param)

    def send(self):
        mailing_param = self.get_mailing_param()

        self.do_telegram_mailing(mailing_param)
        self.do_email_mailing(mailing_param)


if __name__ == '__main__':
    X = IntodayerMailing(2, 1, text='SMS')
    json_str = X.get_mailing_param()

    print(json_str)