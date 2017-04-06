import json
from extra import utils
from intodayer2_app.models import *
from intodayer_bot.bot import do_mailing


class MailingParamJson:
    def __init__(self, sender_id, plan_id, image, text):
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

        # add missing padding
        miss_pad = len(image) % 4
        if miss_pad != 0:
            image += '=' * (4 - miss_pad)

        self.image = image

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
        self.message['recipients'] = []
        recp_list = list(UserPlans.objects.select_related().filter(plan_id=self.plan_id))

        for user in recp_list:
            if user.user.chat_id:
                self.message['recipients'].append({
                    'chat_id': user.user.chat_id,
                    'name': ' '.join(user.user.get_name())
                })

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
        self.message['plan_info'].update({'mem_count': utils.members_amount_suffix(count)})

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
        self.set_msg_image()
        self.set_plan_info()

        print(json.dumps(self.message, ensure_ascii=False, indent=2))

        return json.dumps(self.message, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    tst = MailingParamJson(2, 2, 'f', 'Всем привет как дела ребята хы хы хы епты крым наш')
    print(tst.get_mailing_param())

    do_mailing(tst.get_mailing_param())
