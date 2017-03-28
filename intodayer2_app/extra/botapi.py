from intodayer2_app.models import *
import json
import os


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")


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

    def get_mailing_param(self):
        self.set_sender_name()
        self.set_recipients()
        self.set_msg_text()

        return json.dumps(self.message)


if __name__ == '__main__':
    tst = MailingParamJson(2, 2, 'Всем привет как дела ребята хы хы хы епты крым наш')
    print(tst.get_mailing_param())
