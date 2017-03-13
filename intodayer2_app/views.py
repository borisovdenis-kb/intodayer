from  django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import *
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import auth
from django.contrib.auth.forms import UserCreationForm
from intodayer2_app.forms import CustomUserCreationForm
from intodayer2_app.send_sms import *
from intodayer2_app.models import *
from datetime import *
from django.utils import timezone
from intodayer2_app.utils import *


###################################################################################
#                          ОБРАБОТКА AJAX ЗАПРОСОВ                                #
###################################################################################


def switch_plan_home_ajax(request):
    """
        Функция для переключения между расписаниями
        ___________________________________________________
        :param request:
        :return: отрендеренную html разметку опр расписания
    """
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)
        context = get_today_tomorrow_plans(user.id, plan_id=request.POST['plan_id'])

        return render_to_response('today_tomorrow.html', context)


###################################################################################
#                         ОБРАБОТКА ОБЫЧНЫХ ЗАПРОСОВ                              #
###################################################################################


def welcome_view(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect("/home")
    else:
        return render_to_response('welcome.html')


def registration_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            # сохраняем usr_name и pswd в таблицу auth_user
            form.save()
            # # сохраняем phone и связь один к одному в таблицу custom_user
            # new_user = CustomUser.objects.get(username=request.POST['username'])
            # new_user.phone = request.POST['phone']
            # new_user.save()

            return HttpResponseRedirect('/login')
    else:
        form = CustomUserCreationForm()

    context = {'form': form}
    return render_to_response('reg.html', context)


def home_view(request):
    """
        Функция отображения главной страницы сайта
        с расписанием на сегодня
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)

        context = {'username': user.username}

        all_plans = UserPlans.objects.select_related().filter(user_id=user.id)

        # выбираем текущее расписание юзера
        try:
            cur_plan = UserPlans.objects.select_related().filter(user_id=user.id, current_yn='y')[0]
        except IndexError:
            return render_to_response('home.html', context)

        if all_plans:
            context_td_tm = get_today_tomorrow_plans(user.id, cur_plan.plan.id)

            context['all_plans'] = all_plans
            # объединяем контексты
            context.update(context_td_tm)

            return render_to_response('home.html', context)
        else:
            return render_to_response('home.html', context)
    else:
        return HttpResponseRedirect("/login")


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = auth.authenticate(username=username, password=password)

        if user is not None:
            if user.is_active:
                auth.login(request, user)
                return HttpResponseRedirect("/home")
            else:
                return HttpResponse('POPKA')
        else:
            return HttpResponse('Invalid Login or Password')
    else:
        return render_to_response('auth.html')


def logout_view(request):
    auth.logout(request)
    return HttpResponseRedirect("/")


def add_schedules_view(request):
    """
    Функция отображения страницы добавления расписания. Если у
    старосты уже имеется расписание, то на этой странице выводится
    общее расписание, представляющее весь семестр. Если староста
    хочет что-то изменить в нем, то с боку при наведении на конкретную
    строку расписания будет появляться карандашек, подсказывающий
    возможность изменения. При нажатии активируются поля ввода и староста
    вносит свои именения. Появлется кнопка применить и все красиво.
    Внизу при этом есть поля для добавления новых строк в расписание.
    Как только староста добавит новую строку и нажмет submit, то страница
    обновится (здесь предполагается AJAX) и новая добавленная строка будет
    отображаться в верхней части страницы в расписании на семестр.
    Если ниодной строчки в расписании еще не было создано, то будет выводиться
    сообщения, "Создайте расписание".
    """

    if request.user.is_authenticated():
        user = User.objects.get(username=request.user.username)
        try:
            std_id = user.customuser.stdt_stdt.stdt_id
        except ObjectDoesNotExist:
            context = {'table' : [],
                       'username' : user.username
            }
        else:
            student = Students.objects.get(stdt_id = std_id)
            group = student.grp_grp_id
            cathedra = student.cthd_cthd_id

            # выбираем из тиблицы расписания все записи, "нужные" данному юзеру
            # мы получили список, состоящий из строк расписания
            # далее генерируем расписание на неделю, в зависимости от номера и четности недели
            table = list(Schedules.objects.filter(grp_grp = group, cthd_cthd = cathedra).order_by('tms_tms'))
            current_week = [[], [], [], [], [], [], []]

            for row in table:
                if row.dfwk_dfwk.name == 'Понедельник':
                    current_week[0].append(row)
                elif row.dfwk_dfwk.name == 'Вторник':
                    current_week[1].append(row)
                elif row.dfwk_dfwk.name == 'Среда':
                    current_week[2].append(row)
                elif row.dfwk_dfwk.name == 'Четверг':
                    current_week[3].append(row)
                elif row.dfwk_dfwk.name == 'Пятница':
                    current_week[4].append(row)
                elif row.dfwk_dfwk.name == 'Суббота':
                    current_week[5].append(row)
                elif row.dfwk_dfwk.name == 'Воскресенье':
                    current_week[6].append(row)

            context = {'table' : current_week,
                       'username' : user.username
            }
    else:
        return HttpResponseRedirect('/login')

    if request.method == 'POST':
            print('0')
            print(request.POST)
            new_data = dict(request.POST) # получаем новые данные от клиента

            ###########################################################################
            #                         ЗАНОСИМ ДАННЫЕ В БАЗУ                           #
            ###########################################################################

            count_tchr_id = len(Teachers.objects.all())   # этот говно код
            count_subj_id = len(Subjects.objects.all())   # потому что в БД походу
            count_schld_id = len(Schedules.objects.all()) # не автоинкрементные поля :(

            new_teacher = Teachers(
                tchr_id = count_tchr_id + 1,
                name_short = new_data['teacher'][0]
            )
            new_teacher.save()

            new_subject = Subjects(
                subj_id = count_subj_id + 1,
                name = new_data['subject'][0]

            )
            new_subject.save()

            new_schld_row = Schedules(
                schld_id = count_schld_id + 1,
                grp_grp_id = group,
                cthd_cthd_id = cathedra,
                dfwk_dfwk_id = new_data['dayofweek'][0],
                subj_subj_id = new_subject.subj_id,
                tchr_tchr_id = new_teacher.tchr_id,
                tms_tms_id = new_data['time'][0],
                parity = new_data['parity'][0],
                place = new_data['place'][0],
                start_week = new_data['startweek'][0],
                end_week = new_data['endweek'][0]
            )
            new_schld_row.save()

            return HttpResponseRedirect('/add_schedules')
    else:
        return render_to_response('add_schedules.html', context)


def profile_settings(request):
    if request.user.is_authenticated():
        if request.method == 'POST':
            user = User.objects.get(username=request.user.username)

            # обновляем поля пользователя
            user.username = request.POST['username']
            user.myuser.phone = request.POST['phone']
            user.save()
            sendHelloSMS(request.POST['phone'])
            return HttpResponseRedirect('/home')
        else:
            return render_to_response('myprofile.html', {})
    else:
        return render_to_response('myprofile.html', {})


def plan_view(request):
    """
    Функция, которая выводит таблицу редактирования текущего (выбранного) расписания.
    На странице имеем доступ для всех дней недели и для всего расписания (всех диапазонов) в целом.
    Поэтому, функция выводит всю информацию расписания на весь год, разбитых по дням недели.
    """
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)
        context = {
            'username': user.username,
        }
        # выбираем текущее расписание юзера
        plan_list = UserPlans.objects.select_related().filter(
            user_id=user.id, current_yn='y'
        )
        return render_to_response('plan.html', context)

    else:
        return HttpResponseRedirect("/login", {})
