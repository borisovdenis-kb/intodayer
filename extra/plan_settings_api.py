import json
# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from intodayer2_app.models import *
from extra.mailing_api import *


class PlanSettings():
    """
        Класс предназначен, для реализации функционала настроек расписания.
        Основные функции:
            1. delete_plan;
        1 - Если пользователь, удаляющий расписание, просто подписан на данное расписание, то
        из базы удаляется запись в таблице user_plans, связывающая данного юзера и данное расписание
        Если пользователь, удаляющий расписание - создатель данного расписания, то из базы удаляется
        абсолютно вся информация об этом расписании. Т.е. чистятся все записи, в которых данное
        расписание фигурирует как форин кей.
    """
    def __init__(self, user_id, plan_id):
        self.user_id = user_id
        self.plan_id = plan_id

    def delete_plan(self):
        plan = PlanLists.objects.filter(id=self.plan_id)
        plan = plan[0]

        if plan.owner_id == self.user_id:  # если user, удаляющий расп. - создатель
            # прощальное сообщение
            farewell_message = "Староста удалил это расписание.\n" \
                               "Данное расписание будет удалено из Вашего списка расписаний."

            # mailing = IntodayerMailing(
            #     self.user_id,
            #     self.plan_id,
            #     text=farewell_message,
            # )
            # # совершаем рассылку
            # mailing.send()

            # удаляем расписание из plan_list, после этого в базе сработает триггер,
            # который удалит всю существующую инфу. о данном расписании в базе.
            plan.delete()
        else:
            user_plan_row = UserPlans.objects.get(user_id=self.user_id, plan_id=self.plan_id)
            # удаляем только строчку в user_plans
            user_plan_row.delete()