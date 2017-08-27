# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------------- #
#             В ЭТОМ МОДУЛЕ БУДУТ ХРАНИТЬСЯ ВСЯКИЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ           #
# ---------------------------------------------------------------------------------- #

# ---------------------------------------------------------------
# для того, что бы тестировать django файлы
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
# from intodayer2_app.models import *
# from PIL import Image
# from io import BytesIO
from base64 import b64decode
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import timedelta, datetime
from intodayer2_app.models import (
    DivToPng, PlanRows, Subjects, Teachers, Times, Places, DaysOfWeek
)

# from datetime import timezone


CREATE = 'CREATE'
UPDATE = 'UPDATE'


class CloneError(Exception):
    """
    Исключение для того, чтобы распознать, что пользователь пытается сохранить строку, которая уже существует
    в точности в текущем дне и расписании
    """
    pass


def save_div_png(base64_str, filename):
    img_data = b64decode(base64_str)
    image = ContentFile(img_data, filename)

    new_img = DivToPng(image=image)
    new_img.save()

    return new_img.image.path


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
    delta = datetime.timedelta(7)
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

    today = timezone.make_aware(datetime.now())          # опр сегодняшнюю дату
    tomorrow = today + timedelta(1)             # завтрашняя дата
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
        parity__in=[td_parity, 2]
    )
    tomorrow_plan = PlanRows.objects.select_related().filter(
        plan_id=plan.plan.id,
        day_of_week=tm_weekday + 1,
        start_week__lte=cur_week2,
        end_week__gte=cur_week2,
        parity__in=[tm_parity, 2]
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

    # разделитель между неделями
    context['separator'] = True if cur_week1 != cur_week2 else False

    return context


##################################################################################################
# ЛЕХА!!!!!!!!! ЛЕХА!!!!!!!!!!!
##################################################################################################
# Такие функци нужно выносить в отдельный файл. В файл extra/utils
# Так как в файле view должны быть только вьюшные функции


def edit_plan_row(data, this_plan, this_id, mode):
    """
     1. Создаёт или обновляет строку расписания, взависимости от поданой id
     2. data должны быть переданы полностю для всех полей plan_row
     3. Выдаёт собственные типы ошибок, чтобы распознать их в jquery
    """
    day_of_week, place, parity, teacher, this_time, start_week, end_week, subject = \
        None, None, None, None, None, None, None, None

    # есть ли уже такой предмет в расписании
    if 'subject' in data:
        subjects_objects = Subjects.objects.select_related().filter(plan_id=this_plan, name=data['subject'])
        if subjects_objects.count() == 0:
            subject = Subjects(name=data['subject'], plan=this_plan)
            subject.save()
        else:
            subject = subjects_objects[0]

    # есть ли уже такой учитель в расписании
    if 'teacher' in data:
        teachers_objects = Teachers.objects.select_related().filter(plan_id=this_plan,
                                                                    name_short=data['teacher'])
        if teachers_objects.count() == 0:
            teacher = Teachers(name_short=data['teacher'], plan=this_plan)
            teacher.save()
        else:
            teacher = teachers_objects[0]

    # есть ли уже такое время в расписании
    if 'time' in data:
        dt = datetime.strptime(data['time'], "%H:%M")
        times_objects = Times.objects.select_related().filter(plan_id=this_plan, hh24mm=dt)
        times_objects = Times.objects.select_related().filter(plan_id=this_plan, hh24mm=dt)
        if times_objects.count() == 0:
            this_time = Times(hh24mm=dt, plan=this_plan)
            this_time.save()
        else:
            this_time = times_objects[0]

    # есть ли уже такое место в расписании
    if 'place' in data:
        places_objects = Places.objects.select_related().filter(plan_id=this_plan, name=data['place'])
        if places_objects.count() == 0:
            place = Places(name=data['place'], plan=this_plan)
            place.save()
        else:
            place = places_objects[0]

    if 'day_of_week' in data:
        day_of_week = DaysOfWeek.objects.get(id=data['day_of_week'])

    if 'parity' in data:

        if data['parity'] == 'Все':
            parity = 2
        elif data['parity'] == 'Чет':
            parity = 0
        elif data['parity'] == 'Нечет':
            parity = 1

    if 'start_week' in data:
        start_week = data['start_week']
    if 'end_week' in data:
        end_week = data['end_week']

    # если текущий режим работы фукнции это обновление строку
    # в этом случае новая запись не создаётся
    if mode == UPDATE:
        plan_row_exist_update = PlanRows.objects.select_related().filter(
            plan=this_plan,
            start_week=start_week,
            end_week=end_week,
            parity=parity,
            day_of_week=day_of_week,
            subject=subject,
            teacher=teacher,
            time=this_time,
            place=place
        )

        if plan_row_exist_update:
            raise CloneError(Exception)

        PlanRows.objects.select_related().filter(plan_id=this_plan.id, id=this_id).update(
            start_week=start_week,
            end_week=end_week,
            parity=parity,
            day_of_week=day_of_week,
            subject=subject,
            teacher=teacher,
            time=this_time,
            place=place
        )
        # возвращаем то же самое id
        return this_id

    # если текущий режим работы фукнции это добавление новой строки
    # в этом случае создаётся новый объект PlanRows
    if mode == CREATE:
        plan_row_exist_create = PlanRows.objects.select_related().filter(
            start_week=start_week,
            end_week=end_week,
            parity=parity,
            day_of_week=day_of_week,
            subject=subject,
            teacher=teacher,
            time=this_time,
            place=place,
            plan=this_plan
        )

        if plan_row_exist_create:
            raise CloneError(Exception)

        new_plan_row = PlanRows(start_week=start_week,
                                end_week=end_week,
                                parity=parity,
                                day_of_week=day_of_week,
                                subject=subject,
                                teacher=teacher,
                                time=this_time,
                                place=place,
                                plan=this_plan)

        new_plan_row.save()
        # возвращаем новое id, чтобы записать его в html
        return new_plan_row.id


if __name__ == '__main__':
    start_date = datetime(2017, 4, 1)

    res = get_week_scale(start_date, 5)

    print(res)
