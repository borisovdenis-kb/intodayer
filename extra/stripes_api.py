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
from django.db.models import Max
from extra import utils


# TODO: Сделать двумерный массив.

class Stripes:
    """
        Класс для формирования json Полосок
        для клиента.
        Во view нужно сделать следующее.
        X = Stripes(plan_id)
        X.get_stripes_json()
    """
    def __init__(self, plan_id):
        self.plan_id = plan_id
        self.MAX_LEN = []        # Максимальное кол-во недель в расписании.
        self.scale = []
        self.stripes = {}

    def set_max_len(self):
        """
            Функция вовзращает максимальное кол-во недель
            в расписании.
            :return: 
        """
        max_len = PlanRows.objects.filter(plan_id=1).aggregate(Max('end_week'))
        self.MAX_LEN = max_len['end_week__max']

        self.stripes['MAX_LEN'] = list(range(self.MAX_LEN + 1))

    def set_scale(self):
        """
            Функция устанавливает список с датами.
            Пример. start_date = 01.04.17, n = 3
            ["Apr, 01", "Apr, 08", "Apr, 15"]
        """
        plan = PlanLists.objects.get(id=self.plan_id)

        self.scale = utils.get_week_scale(plan.start_date, self.MAX_LEN)
        self.stripes['scale'] = self.scale

    def set_stripes(self):
        """
            Функция возращает вовзращает "Полоски" в формате,
            как выглядит который можно посмотреть в stripes-concept/stripes-format.json.
            :return: 
        """
        plan_rows = PlanRows.objects.select_related().filter(plan_id=self.plan_id)
        # устанавливаем максимальное кол-во недель
        self.set_max_len()

        # инициализируем словарь stripes
        for subj in Subjects.objects.filter(plan_id=self.plan_id):
            self.stripes[subj.name] = {
                '1': [0] * self.MAX_LEN,
                '2': [0] * self.MAX_LEN,
                '3': [0] * self.MAX_LEN,
                '4': [0] * self.MAX_LEN,
                '5': [0] * self.MAX_LEN,
                '6': [0] * self.MAX_LEN,
                '7': [0] * self.MAX_LEN
            }

        # собираем "Полоски"
        for row in plan_rows:
            subj = row.subject.name
            day = str(row.day_of_week_id)

            for i in range(row.start_week, row.end_week + 1):
                if row.parity is not None:
                    if i % 2 == row.parity:
                        self.stripes[subj][day][i-1] += 1
                else:
                    self.stripes[subj][day][i-1] += 1

    def get_stripes_json(self):
        self.set_max_len()
        self.set_scale()
        self.set_stripes()

        return json.dumps(self.stripes, ensure_ascii=False)


if __name__ == '__main__':
    X = Stripes(1)
    res = X.get_stripes_json()

    print(res)