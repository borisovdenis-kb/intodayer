import json

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
from intodayer2_app.api import *

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
        # get_today_tomorrow_plans возвращает словарь
        context = get_today_tomorrow_plans(user.id, plan_id=request.POST['plan_id'])

        return render_to_response('today_tomorrow.html', context)


def get_invitations_ajax(request):
    """
        Функция должна вернуть html разметку с имеющимися
        у данного пользователся приглашениями.
        _________________________________________________
        :param request:
        :return: html разметка с приглашениями
    """
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)
        invitations = Invitations.objects.select_related().filter()
        context = {
            'invitations': invitations,
            'user': user
        }

        return render_to_response('invitations.html', context)


def confirm_invitation_ajax(request):
    """
        Функция реагирует на выбор пользовтеля:
            принял приглашение - confirmed_yn = y
            отклонить приглашение - confirmed_yn = n
        Далее в БД должен сработать соотв. триггер.
        ____________________________________________
        :param request:
        :return: ?
    """
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)
        inv = Invitations.objects.get(to_user=user.id, plan_id=request.GET['plan_id'])

        print(request.GET['decision'])

        inv.confirmed_yn = 'y' if request.GET['decision'] == '1' else 'n'
        inv.save()

        response = HttpResponse()
        response['Content-Type'] = 'text/javascript'
        response.write(json.dumps([{'success': 1}]))

        return response


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


def plan_view(request, plan_id=0):
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
        plan = plan_list[0]
        all_plans = UserPlans.objects.select_related().filter(user_id=user.id)
        count = all_plans.count()
        # все расписания
        context['all_plans'] = all_plans
        # имя описание плана
        context['plan_info'] = [plan.plan.title, plan.plan.description]
        # количество участников
        context['plan_info'] += [members_amount_suffix(count)]

        if plan_id == 0:
            plan_rows = PlanRows.objects.select_related().filter(
                plan_id=plan.plan.id,
            ).order_by('start_week')
        else:
            inv = Invitations.objects.filter(to_user=user.id, plan_id=plan_id)
            if inv:
                context['is_invitation'] = True
                context['invitation'] = inv[0]
                plan_rows = PlanRows.objects.select_related().filter(
                    plan_id=plan_id,
                ).order_by('start_week')
            else:
                return render_to_response("ops_page.html")

        day_of_weeks = DaysOfWeek.objects.all()

        context['day_of_weeks'] = day_of_weeks
        context['plan_rows'] = plan_rows

        return render_to_response('plan.html', context)

    else:
        return HttpResponseRedirect("/login", {})


def sort_by_start_date(row):
    return row.start_week
