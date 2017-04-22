import json

# ---------------------------------------------------------------
# для того, что бы тестировать django файлы
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------

from intodayer2_app.models import *
from django.db.models import Max


class Stripes:
    def __init__(self, plan_id):
        self.plan_id = plan_id
        self.MAX_LEN = 0        # Максимальное кол-во недель в расписании.
        self.stripes = {}

    def set_max_len(self):
        max_len = PlanRows.objects.filter(plan_id=1).aggregate(Max('end_week'))
        self.MAX_LEN = max_len['end_week__max']

        self.stripes['MAX_LEN'] = self.MAX_LEN

    def get_stripes_json(self):
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

        return json.dumps(self.stripes, ensure_ascii=False)

    # def interval_to_array(self, start, end, parity=None):
    #     """
    #         Функция возвращает для заданного интервала последовательность.
    #         Т.е. [1-8] -> 1, 2, 3, 4, 5, 6, 7, 8
    #         Т.е. [1-8] parity = 0 -> 2, 4, 6, 8
    #         Т.е. [1-8] parity = 1 -> 1, 3, 5, 7
    #     """
    #     if parity is not None:
    #         return [i for i in range(start, end + 1) if i % 2 == parity]
    #     else:
    #         return [i for i in range(start, end + 1)]
    #
    # def intersec(self, intervals, n):
    #     """
    #         Функция пересечения произвольного количества
    #         промежутков недель в расписании.
    #         :param intervals: множество промежутков вида
    #             [[start, end, parity], ...]
    #         :return: последовательность вида:
    #             n1,n2,...,ni, ni - кол-во множеств содержащих i
    #     """
    #     arr = []
    #     res = [0] * n
    #
    #     for start, end, par in intervals:
    #         arr += self.interval_to_array(start, end, par)
    #
    #     for i in range(1, n+1):
    #         res[i-1] = arr.count(i)
    #
    #     return res


if __name__ == '__main__':
    X = Stripes(1)
    res = X.get_stripes_json()

    print(res)