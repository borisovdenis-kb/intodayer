from intodayer2_app.models import *
from intodayer2_app.extra.utils import *
from socket import *
import json
import os


class SocketSend:
    def __init__(self, data):
        """
        data: данные для рассылки в формате JSON
        - имя отправителя
        - список получателей
        - от какого расписания идет рассылка
        :param data:
        """
        self.data = data


class MailingParamJson:
    def __init__(self, sender_id, plan_id, text):
        """
            message - словарь в который будет собираться
            вся необходимая боту информация для рассылки
            :param sender_id:
            :param text:
        """
        self.message = {}
        self.msg_text = text
        self.plan_id = plan_id
        self.sender_id = sender_id

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
            Собирает телеграмовские chat_id получателей
            :return:
        """
        recp_list = list(UserPlans.objects.select_related().filter(plan_id=self.plan_id))
        recp_list = [x.user.chat_id for x in recp_list if x.user.chat_id]
        self.message['recipients'] = recp_list

    def set_msg_text(self):
        self.message['text'] = self.msg_text

    def set_plan_info(self):
        """
            Собирает информацию об расписания, от которого идет рассылка.
            :return:
        """
        count = UserPlans.objects.select_related().filter(plan_id=self.plan_id).count()
        plan = PlanLists.objects.get(id=self.plan_id)

        self.message['plan_info'] = [plan.title, plan.description]
        self.message['plan_info'] += [members_amount_suffix(count)]

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
        self.set_plan_info()

        return json.dumps(self.message)


if __name__ == '__main__':
    tst = MailingParamJson(2, 2, 'Всем привет как дела ребята хы хы хы епты крым наш')
    print(tst.get_mailing_param())
