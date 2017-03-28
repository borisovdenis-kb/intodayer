import datetime
import json

from django.contrib import auth
from django.contrib.auth.models import *
from django.db.utils import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import HttpResponseBadRequest
from django.shortcuts import render_to_response

from intodayer2_app.extra.utils import *
from intodayer2_app.forms import *
from intodayer2_app.send_sms import *


###################################################################################
#                          ОБРАБОТКА AJAX ЗАПРОСОВ                                #
###################################################################################


def plan_update_delete(request):
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)
        plan_list = UserPlans.objects.select_related().get(user_id=user.id, current_yn='y')
        data = request.POST
        if 'delete_id_planRow' in data:
            delete_id = data['delete_id_planRow']
            # выбираем все строчки расписания именно данного пользователя
            user_plan_rows = PlanRows.objects.select_related().filter(plan_id=plan_list.id)
            user_plan_rows.get(id=delete_id).delete()
        return HttpResponse('Успешно удалено!')
    else:
        return HttpResponseBadRequest()


def plan_update_clone(request):
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)
        # выбираем текущее расписание юзера
        plan_list = UserPlans.objects.select_related().get(user_id=user.id, current_yn='y')
        data = request.POST

        this_plan = plan_list.plan
        day_of_week, place, parity, teacher, this_time, start_week, end_week, subject = \
            None, None, None, None, None, None, None, None

        if 'day_of_week' in data:
            day_of_week = DaysOfWeek.objects.get(id=data['day_of_week'])

        if 'place' in data:
            place = Places(name=data['place'], plan=this_plan)
            place.save()

        if 'parity' in data:
            parity = data['parity']

        if 'teacher' in data:
            teacher = Teachers(name_short=data['teacher'], plan=this_plan)
            teacher.save()
        if 'time' in data:
            dt = datetime.datetime.strptime(data['time'], "%H:%M")
            this_time = Times(hh24mm=dt, plan=this_plan)
            this_time.save()

        if 'start_week' in data:
            start_week = data['start_week']

        if 'end_week' in data:
            end_week = data['end_week']

        if 'subject' in data:
            subject = Subjects(name=data['subject'], plan=this_plan)
            subject.save()

        # пока некоторые поля по умолчанию для теста
        try:
            new_row = PlanRows(plan=this_plan, place=place, parity=parity,
                               teacher=teacher, time=this_time, start_week=start_week, end_week=end_week,
                               subject=subject, day_of_week=day_of_week,
                               comment="Пусто")
            new_row.save()
            return HttpResponse('Успешно продублировано!')
        except IntegrityError:
            return HttpResponseBadRequest()
    else:
        return HttpResponseBadRequest()


def switch_plan_home_ajax(request):
    """
        Функция для переключения между расписаниями
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
        :param request:
        :return: ?
    """
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)
        inv = Invitations.objects.select_related().get(to_user=user.id, plan_id=request.GET['plan_id'])

        print(request.GET['decision'])

        inv.confirmed_yn = 'y' if request.GET['decision'] == '1' else 'n'
        inv.save()

        if inv.confirmed_yn == 'y':
            # добавляем расписание и удаляем приглашение
            new = UserPlans(
                user_id=user.id,
                plan_id=request.GET['plan_id'],
                current_yn='n'
            )
            new.save()

        inv.delete()

        response = HttpResponse()
        response['Content-Type'] = 'text/javascript'
        response.write(json.dumps([{'success': 1}]))

        return response


def save_user_avatar_ajax(request):
    """
        Функция сохраняет загруженную пользователем аватарку
        :param request:
        :return:
    """
    if request.is_ajax():
        form = SetAvatarForm(request.POST, request.FILES)
        response = HttpResponse()
        response['Content-Type'] = 'text/javascript'

        if form.is_valid():
            user = CustomUser(username=request.user.username)
            user.avatar = request.FILES['image_file']
            user.save()

            response.write(json.dumps([{'success': 1}]))
        else:
            response.write(json.dumps([{'success': 0}]))

        return response


def save_plan_avatar_ajax(request, plan_id):
    """
        Функция сохраняет загруженную пользователем аватарку
        :param plan_id:
        :param request:
        :return:
    """
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)
        plan = PlanLists.objects.get(id=plan_id, owner=user.id)

        response = HttpResponse()
        response['Content-Type'] = 'text/javascript'

        if plan:
            # если пользователь имеет права редактирования
            # удаляем предыдущую аватарку
            plan.avatar.delete()
            # сохраняем новую
            plan.avatar = request.FILES['avatar']
            plan.save()

            response.write(json.dumps([{'success': 1}]))
        else:
            response.write(json.dumps([{'success': 0}]))

        return response


def get_avatar_ajax(request):
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)

        response = HttpResponse()
        response['Content-Type'] = 'text/javascript'

        try:
            if request.GET['user_id']:
                response.write(json.dumps({'url': user.get_image_url()}))
                return response
        except KeyError:
            pass

        try:
            if request.GET['plan_id']:
                # если хотим получить аватарку расписания
                plan = PlanLists.objects.get(id=request.GET['plan_id'])

                response.write(json.dumps({
                    'url': plan.get_image_url(),
                    'isOwner': True if plan.owner == user else False
                }))
                return response
        except KeyError:
            pass

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
        context = {'user': user}

        all_plans = UserPlans.objects.select_related().filter(user_id=user.id)

        # выбираем текущее расписание юзера
        try:
            cur_plan = UserPlans.objects.select_related().filter(user_id=user.id, always_yn='y')[0]
        except IndexError:
            cur_plan = all_plans[0]

        if all_plans:
            context['image_form'] = SetAvatarForm
            context['all_plans'] = all_plans
            context['cur_plan'] = cur_plan

            # объединяем контексты
            context_td_tm = get_today_tomorrow_plans(user.id, cur_plan.plan.id)
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

        all_plans = UserPlans.objects.select_related().filter(user_id=user.id)
        count = all_plans.count()

        try:
            cur_plan = UserPlans.objects.select_related().filter(user_id=user.id, current_yn='y')[0]
        except IndexError:
            cur_plan = all_plans[0]

        if plan_id == 0:
            # выбираем текущее расписание юзера
            plan_list = UserPlans.objects.select_related().filter(
                user_id=user.id, current_yn='y'
            )
            plan = plan_list[0]

            plan_rows = PlanRows.objects.select_related().filter(
                plan_id=plan.plan.id,
            ).order_by('start_week')
        else:
            inv = Invitations.objects.filter(to_user=user.id, plan_id=plan_id)
            if inv:
                context['is_invitation'] = True
                context['invitation'] = inv[0]

                plan_list = UserPlans.objects.select_related().filter(
                    user_id=user.id, plan_id=plan_id
                )
                plan = plan_list[0]

                plan_rows = PlanRows.objects.select_related().filter(
                    plan_id=plan_id,
                ).order_by('start_week')
            else:
                return render_to_response("ops_page.html")

        # все расписания
        context['all_plans'] = all_plans
        context['cur_plan'] = cur_plan
        # имя описание плана
        context['plan_info'] = [plan.plan.title, plan.plan.description]
        # количество участников
        context['plan_info'] += [members_amount_suffix(count)]

        day_of_weeks = DaysOfWeek.objects.all()

        context['day_of_weeks'] = day_of_weeks
        context['plan_rows'] = plan_rows

        return render_to_response('plan.html', context)

    else:
        return HttpResponseRedirect("/login", {})


def sort_by_start_date(row):
    return row.start_week

