from datetime import *
from django.utils import timezone
from intodayer2_app.models import *


######################################################################################
#             В ЭТОМ МОДУЛЕ БУДУТ ХРАНИТЬСЯ ВСЯКИЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ           #
######################################################################################


def members_amount_suffix(n):
    """
        Функция определяет нужно окончание в слове участник
        для заданного n
        ____________________________________________________
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
        ________________________________________________
        :param start: дата, от которой считаются недели
        :param end: дата, до которой считаются недели
        :return: weeks
    """
    days = end - start

    if end.weekday() >= start.weekday():
        return (days.days // 7) + 1
    else:
        return (days.days // 7) + 2


def get_today_tomorrow_plans(user_id, plan_id):
    """
        Функция делает выборку строк расписания
        на сегодняшний и на завтрашний день,
        учитывая номер недели, четность недели и т.д.
        _____________________________________________
        :param user_id:
        :param plan_id:
        :return:
    """
    context = {}

    cur_plan = UserPlans.objects.select_related().filter(user_id=user_id, plan_id=plan_id)[0]

    count = UserPlans.objects.filter(plan_id=cur_plan.plan.id).count()

    today = timezone.make_aware(datetime.now())   # опр сегодняшнюю дату
    tomorrow = today + timedelta(1)               # завтрашняя дата
    td_weekday = datetime.weekday(today)          # день недели сегодня
    tm_weekday = datetime.weekday(tomorrow)       # день дедели завтра
    start_date = cur_plan.plan.start_date             # c какого числа действует расп.
    cur_week1 = weeks_from(start_date, today)     # определяем номер текущей недели
    cur_week2 = weeks_from(start_date, tomorrow)
    td_parity, tm_parity = cur_week1 % 2, cur_week2 % 2  # четность недели

    format1 = '%Y %m %d'
    format2 = '%A, %d. %B %Y'

    today_plan = PlanRows.objects.select_related().filter(
        plan_id=cur_plan.plan.id,
        day_of_week=td_weekday + 1,
        start_week__lte=cur_week1,
        end_week__gte=cur_week1,
        parity=td_parity
    )
    tomorrow_plan = PlanRows.objects.select_related().filter(
        plan_id=cur_plan.plan.id,
        day_of_week=tm_weekday + 2,
        start_week__lte=cur_week1,
        end_week__gte=cur_week1,
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
    context['cur_plan_info'] = [cur_plan.plan.title, cur_plan.plan.description]
    # добавляем кол-во участников
    context['cur_plan_info'] += [members_amount_suffix(count)]
    # разделитель между неделями
    context['separator'] = True if cur_week1 != cur_week2 else False

    return context


def get_rows_by_weekday(rows):
    """
        Задача этой функции в том, чтобы распределить
        строки рассписания по дням недели, отсортировав
        их по времени
        _______________________________________________
        :param rows: строки рассписания, заранее выбранный из таблицы
        :return: days
    """
    # rows = PlanRows.objects.select_related().filter(plan_id=plan_id).order_by('time')

    # days = {
    #     'monday': [],
    #     'tuesday': [],
    #     'wednesday': [],
    #     'thursday': [],
    #     'friday': [],
    #     'saturday': [],
    #     'sunday': [],
    # }
    days = [[i] for i in range(7)]
    for row in rows:
        if row.day_of_week.name == 'Понедельник':
            days[0].append(row)
        elif row.day_of_week.name == 'Вторник':
            days[1].append(row)
        elif row.day_of_week.name == 'Среда':
            days[2].append(row)
        elif row.day_of_week.name == 'Четверг':
            days[3].append(row)
        elif row.day_of_week.name == 'Пятница':
            days[4].append(row)
        elif row.day_of_week.name == 'Суббота':
            days[5].append(row)
        elif row.day_of_week.name == 'Воскресенье':
            days[6].append(row)

    return days