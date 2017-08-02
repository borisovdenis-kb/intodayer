import unittest
# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from django.core.exceptions import ValidationError
from intodayer2_app.models import (
    CustomUser, PlanLists, UserPlans, UserMailingChannels,
    Invitations, PlanRows, Times, DaysOfWeek
)


class MyTestCase(unittest.TestCase):
    def test_something(self):
        custom_user = CustomUser.objects.get(id=2)
        plan_lists = PlanLists.objects.get(id=248)
        user_plans = UserPlans.objects.get(id=287)
        user_mailing_channels = UserMailingChannels.objects.get(id=1)
        invitations = Invitations.objects.get(id=88)
        plan_rows = PlanRows.objects.get(id=1)
        times = Times.objects.get(id=1)
        days_of_week = DaysOfWeek.objects.get(id=1)

        models = {
            'custom_user': custom_user,
            'plan_list': plan_lists,
            'user_plan': user_plans,
            'user_mailing_channels': user_mailing_channels,
            'invitations': invitations,
            'plan_rows': plan_rows,
            'times': times,
            'day_of_week': days_of_week
        }

        model_data = {
            'custom_user': {'first_name': '', 'last_name': '', 'email': 'asaf@adsa', 'phone': '999a', 'chat_id': 'ada1'},
            'plan_list': {'title': '', 'start_date': '2017.01.01'},
            'user_plan': {'current_yn': '0', 'role': 'afadre3'},
            'user_mailing_channels': {'email_yn': 'a', 'telegram_yn': 'p'},
            'invitations': {'email': 'adfafa', 'confirmed_yn': 'b'},
            'plan_rows': {'parity': 3, 'start_week': -11, 'end_week': -11},
            'times': {'hh24mm': '12:99'},
            'day_of_week': {'name': 'Воскреaсенье'}
        }

        for model_name, model_obj in models.items():
            try:
                model_obj.update(**model_data[model_name])
            except ValidationError as e:
                print('--->', model_name)
                print(e)
                print()
                continue
            continue


if __name__ == '__main__':
    unittest.main()
