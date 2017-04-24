import json
# ---------------------------------------------------------------
# для того, что бы тестировать django файлы
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from django.utils import timezone
from intodayer2_app.models import *
from PIL import Image
from io import BytesIO
from base64 import b64decode
from django.core.files.base import ContentFile
from datetime import datetime, timedelta

######################################################################################
#             В ЭТОМ МОДУЛЕ БУДУТ ХРАНИТЬСЯ ВСЯКИЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ           #
######################################################################################


def save_div_png(base64_str, filename):
    img_data = b64decode(base64_str)
    image = ContentFile(img_data, filename)

    new_img = DivToPng(image=image)
    new_img.save()

    return new_img.image.path


def members_amount_suffix(n):
    """
        Функция определяет нужно окончание в слове участник
        для заданного n
        :param n: целое число
        :return res: строка
    """
    res = ''

    if (n % 10) in [0, 5, 6, 7, 8, 9]:
        res = '%s участников' % n
    elif (n % 10) in [2, 3, 4]:
        res = '%s участника' % n
    else:
        res = '%s участник' % n

    return res


def weeks_from(start, end):
    """
        Функция считает какая по счету неделя с опр даты
        :param start: дата, от которой считаются недели
        :param end: дата, до которой считаются недели
        :return: weeks
    """
    days = end - start

    if end.weekday() >= start.weekday():
        return (days.days // 7) + 1
    else:
        return (days.days // 7) + 2


def get_week_scale(start_date, n):
    """
        Функция возвращает список с датами.
        Пример. start_date = 24.04.17, n = 3
        [24.04, 01.05, 08.05]    
        :return: list
    """
    delta = timedelta(7)
    scale = [start_date.strftime('%b, %d')]

    for i in range(n):
        start_date += delta
        scale.append(start_date.strftime('%b, %d'))

    return scale

def get_today_tomorrow_plans(plan):
    """
        Функция делает выборку строк расписания
        на сегодняшний и на завтрашний день,
        учитывая номер недели, четность недели и т.д.
        :param user_id:
        :param plan_id:
        :return:
    """
    context = {}

    # количество участников
    count = UserPlans.objects.filter(plan_id=plan.plan.id).count()

    today = timezone.make_aware(datetime.now())          # опр сегодняшнюю дату
    tomorrow = today + timedelta(1)                      # завтрашняя дата
    td_weekday = datetime.weekday(today)                 # день недели сегодня
    tm_weekday = datetime.weekday(tomorrow)              # день дедели завтра
    start_date = plan.plan.start_date                    # c какого числа действует расп.
    cur_week1 = weeks_from(start_date, today)            # определяем номер текущей недели
    cur_week2 = weeks_from(start_date, tomorrow)
    td_parity, tm_parity = cur_week1 % 2, cur_week2 % 2  # четность недели

    format1 = '%Y %m %d'
    format2 = '%A, %d. %B %Y'

    today_plan = PlanRows.objects.select_related().filter(
        plan_id=plan.plan.id,
        day_of_week=td_weekday + 1,
        start_week__lte=cur_week1,
        end_week__gte=cur_week1,
        parity=td_parity
    )
    tomorrow_plan = PlanRows.objects.select_related().filter(
        plan_id=plan.plan.id,
        day_of_week=tm_weekday + 1,
        start_week__lte=cur_week2,
        end_week__gte=cur_week2,
        parity=tm_parity
    )

    context['today_plan'] = {
        'date': today.strftime(format1),
        'format_date': today.strftime(format2),
        'plan_rows': today_plan,
    }
    context['tomorrow_plan'] = {
        'date': tomorrow.strftime(format1),
        'format_date': tomorrow.strftime(format2),
        'plan_rows': tomorrow_plan
    }

    # инфа о текущем расписании
    context['cur_plan_info'] = [plan.plan.title, plan.plan.description]
    # добавляем кол-во участников
    context['cur_plan_info'] += [members_amount_suffix(count)]
    # разделитель между неделями
    context['separator'] = True if cur_week1 != cur_week2 else False

    return context


if __name__ == '__main__':
    start_date = datetime(2017, 4, 1)

    res = get_week_scale(start_date, 5)

    print(res)