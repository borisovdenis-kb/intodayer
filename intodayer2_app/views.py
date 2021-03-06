# -*- coding: utf-8 -*-

import json
from datetime import datetime

from api.registrationApi import send_activation_link
from extra.stripes_api import Stripes
from django.db.utils import IntegrityError
from django.contrib.auth.models import auth
from django.contrib.auth import get_user_model
from django.shortcuts import render_to_response
from django.contrib.auth.backends import ModelBackend
from intodayer2_app.forms import CustomUserCreationForm

# from apis.planApi import get_user_plan_rights

from extra.utils import (
    edit_plan_row, get_today_tomorrow_plans, CloneError, UPDATE, CREATE
)
from django.http import (
    HttpResponse, HttpResponseRedirect, HttpResponseBadRequest, JsonResponse
)

from intodayer2_app.models import (
    UserPlans, Invitations, PlanRows, DaysOfWeek, CustomUser, UserMailingChannels,
    EmailActivation)


# TODO: Сделать в выводе расписания в /plan сортировку по времени, а не по неделям


class EmailBackend(ModelBackend):
    def authenticate(self, username=None, password=None, **kwargs):
        try:
            UserModel = get_user_model()
            user = UserModel.objects.get(email=username)
        except UserModel.DoesNotExist:
            return None
        else:
            if getattr(user, 'is_active', False) and user.check_password(password):
                return user
        return None


def check_email_unique(request):
    if request.is_ajax():
        data = json.loads(request.body.decode('utf-8'))

        try:
            if CustomUser.objects.filter(email=data['email']).count() == 0:
                return JsonResponse({'is_exist': False}, status=200)
            else:
                return JsonResponse({'is_exist': True}, status=200)
        except ValueError:
            return HttpResponse(status=400)
    else:
        return HttpResponse(status=400)


# Почему-то не получается перенести эту функцию в planSettingsApi
def get_settings_plan_html(request):
    if request.is_ajax():
        context = dict()
        context.update(get_cur_plan(request))
        context.update(get_user_plan_rights(request.user, context['cur_plan'].plan.id))
        print(context)
        return render_to_response('templates_for_ajax/settings_ajax.html', context)


def get_invite_settings_html(request):
    if request.is_ajax():
        context = dict()
        context.update(get_cur_plan(request))
        return render_to_response('templates_for_ajax/invite_settings.html', context)


def edit_plan_row_ajax(request):
    """
        1. Главная фукнция создания и обновления расписания
        2. Взависимости от поданой id фукнция определяет обновление или создание строки
        3. Обрабатывает разные виды исключений, чтобы распознать действия в jquery
    :param request:
    :return:
    """
    if request.is_ajax():
        user = CustomUser.objects.get(email=request.user.email)
        # выбираем текущее расписание юзера
        plan_list = UserPlans.objects.select_related().get(user_id=user.id, current_yn='y')
        data = request.POST
        this_plan = plan_list.plan
        response = HttpResponse()
        response['Content-Type'] = 'application/json'

        if 'id' in data:
            this_id = data['id']

            # если мы обновляем уже созданную строку то
            if this_id != '0':
                try:
                    this_id = edit_plan_row(data, this_plan, this_id, UPDATE)

                except (IntegrityError, ValueError):
                    response.write(json.dumps({"error": "error", 'id': this_id}))
                    return response
                except CloneError:
                    response.write(json.dumps({"clone_error": "clone_error", 'id': this_id}))
                    return response

                response.write(
                    json.dumps({'message': "Успешно обновлено!", 'id': this_id}))
                return response

            # если мы создаём совсем новую строку то
            else:
                try:
                    this_id = edit_plan_row(data, this_plan, this_id, CREATE)

                except (IntegrityError, ValueError):
                    response.write(json.dumps({"error": "error", 'id': this_id}))
                    return response
                except CloneError:
                    response.write(json.dumps({"clone_error": "clone_error", 'id': this_id}))
                    return response

                response.write(
                    json.dumps({'message': "Успешно добавлено!", 'id': this_id}))
                return response
        else:
            return HttpResponseBadRequest()
    else:
        return HttpResponseBadRequest()


def plan_delete_ajax(request):
    """
    1. Удаляет строку расписания из PlanRows
    2. Ориентируется только по id и текущем выбранном расписании пользователя
    """
    if request.is_ajax():
        user = CustomUser.objects.get(email=request.user.email)
        plan = UserPlans.objects.select_related().get(user_id=user.id, current_yn='y')
        data = request.POST

        if 'id' in data:
            delete_id = data['id']
            # выбираем все строчки расписания именно данного пользователя
            PlanRows.objects.get(plan_id=plan.plan.id, id=delete_id).delete()
            return HttpResponse('Успешно удалено!')
        else:
            return HttpResponseBadRequest()
    else:
        return HttpResponseBadRequest()


def left_content_load_ajax(request):
    """
        Функция динамически загружает левый контент сайта
    """
    if request.is_ajax():
        if request.user.is_authenticated():
            user = CustomUser.objects.get(email=request.user.email)
            all_plans = UserPlans.objects.select_related().filter(user_id=user.id)
            context = dict()

            context['user'] = user
            context['all_plans'] = all_plans

            return render_to_response('content_pages/left_content.html', context, status=200)
        else:
            return HttpResponse(401)
    else:
        return HttpResponse(400)


def switch_plan_home_ajax(request):
    """
        Функция для переключения между расписаниями со страницы /home
        :param request:
        :return: Отрендеренная html разметка расписания
    """
    if request.is_ajax():
        if request.user.is_authenticated():
            context = dict()
            user = CustomUser.objects.get(email=request.user.email)

            try:
                plan_id = int(request.POST['plan_id'])
                context.update(get_cur_plan(request, plan_id))
            except ValueError:
                return render_to_response('templates_for_ajax/content_errors.html')
            except IndexError:
                return render_to_response('templates_for_ajax/content_errors.html')

            context.update(get_dates_info(context['cur_plan']))
            # устанавливаем current_yn для созданного расписания
            # plan_id = context['cur_plan'].plan_id
            user.set_current_plan(plan_id)

            return render_to_response('content_pages/right_content_home.html', context, status=200)
        else:
            return HttpResponse(status=401)
    else:
        return HttpResponse(status=400)


def get_invitations_ajax(request):
    """
        Функция должна вернуть html разметку с имеющимися
        у данного пользователся приглашениями.
        :param request:
        :return: html разметка с приглашениями
    """
    if request.is_ajax():
        user = CustomUser.objects.get(email=request.user.email)
        invitations = Invitations.objects.select_related().filter()
        context = {
            'invitations': invitations,
            'user': user
        }

        return render_to_response('templates_for_ajax/invitations.html', context)


def get_all_plans(request):
    """
    Возвращает контекст со списком всех расписаний
    """
    context = dict()
    user = CustomUser.objects.get(email=request.user.email)

    all_plans = UserPlans.objects.select_related().filter(user_id=user.id)
    if all_plans.count() > 0:
        context['select_flag'] = True
    context['all_plans'] = all_plans

    return context


def get_cur_plan(request, plan_id=None):
    """
        Возвращает контекст с текущим выбранным расписанием
        или формирует страницу, если такой отсутствует
    """
    context = dict()
    user = CustomUser.objects.get(email=request.user.email)

    # если расписание уже существует
    if not plan_id:
        cur_plan = UserPlans.objects.select_related().filter(user_id=user.id, current_yn='y')
    # если мы переключаем расписание то делаем текущим на который нажали (при помощи plan_id)
    else:
        cur_plan = UserPlans.objects.select_related().filter(user_id=user.id, plan_id=plan_id)
    all_plans = UserPlans.objects.select_related().filter(user_id=user.id)

    if cur_plan.count() == 0:
        if all_plans.count() == 0:
            context['cur_plan'] = 0
        else:
            context['select_flag'] = True
            context['cur_plan'] = 0
    else:
        cur_plan = cur_plan[0]
        context['cur_plan'] = cur_plan

    return context


def get_dates_info(cur_plan):
    """
        Возвращает контекст с другими информационными данными
        такие как: имена дней недели, дата начала работы расписания
    """
    context = dict()

    day_of_weeks = DaysOfWeek.objects.all()
    this_start_date = cur_plan.plan.start_date
    this_start_date = datetime.strftime(this_start_date, "%d.%m.%Y")
    context['day_of_weeks'] = day_of_weeks
    context['start_date'] = this_start_date

    return context


def get_this_user(request):
    """
        Возвращает контекст с текущим пользователем
    """
    user = CustomUser.objects.get(email=request.user.email)
    context = dict()
    context['user'] = user
    return context


def login_view(request, message_type):
    context = {
        'auth_error': True if message_type == 'auth_error' else False,
        'success_activation': True if message_type == 'success_activation' else False
    }

    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        user = auth.authenticate(username=email, password=password)

        if user is not None:
            if user.is_active:
                auth.login(request, user)
                if 'state' in request.session:
                    if request.session['state']['operation'] == 'confirm_invitation':
                        url = "/invitation/{}".format(request.session['state']['uuid'])
                        return HttpResponseRedirect(url)
                else:
                    return HttpResponseRedirect("/home")
            else:
                return HttpResponse('User is not active.')
        else:
            return HttpResponseRedirect("/login/message/auth_error")
    else:
        return render_to_response('login.html', context)


def logout_view(request):
    auth.logout(request)
    return HttpResponseRedirect("/")


def registration_view(request, message_type):
    context = {
        'activation_is_expire': True if message_type == 'activation_is_expire' else False
    }
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            try:
                new_user = form.save()
            except AttributeError:
                pass

            new_user.update(**{'username': new_user.email})
            new_user.add_new_plan()

            # добавляем дефолтные настройки
            UserMailingChannels.objects.create(user_id=new_user.id, telegram_yn='n', email_yn='n')

            # привязывает код активации к данному пользователю
            activation_key = EmailActivation.generate_activation_key(new_user.email)
            EmailActivation.objects.create(user_id=new_user.id, activation_key=activation_key)

            # отправляем пользователю письмо с сылкой для подтверждения
            send_activation_link(new_user.email, activation_key)

            return HttpResponseRedirect('/login')
    else:
        form = CustomUserCreationForm()

    context['form'] = form
    return render_to_response('reg.html', context)


def welcome_view(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect("/home")
    else:
        return render_to_response('welcome.html')


def home_view(request, message_type):
    """
        Функция отображения главной страницы сайта
        с расписанием на сегодня
    """
    if request.user.is_authenticated():
        context = {
            'success_activation': True if message_type == 'success_activation' else False,
            'to_many_requests': True if message_type == 'to_many_requests' else False,
            'activation_link_sent': True if message_type == 'activation_link_sent' else False
        }
        context.update(get_this_user(request))
        context.update(get_all_plans(request))
        context.update(get_cur_plan(request))
        if context['cur_plan'] == 0:
            return render_to_response('plan_empty.html', context)
        context.update(get_dates_info(context['cur_plan']))

        # get_today_tomorrow_plans возвращает словарь
        context.update(get_today_tomorrow_plans(context['cur_plan']))

        return render_to_response('home.html', context)

    else:
        return HttpResponseRedirect("/login", status=401)


def get_user_plan_rights(user, plan_id):
    context = {}
    if user.has_rights(action='edit_plan', **{'plan_id': plan_id}):
        context['user_has_edit_plan'] = True
        context['user_role'] = UserPlans.objects.get(user_id=user.id, plan_id=plan_id).role
    return context


def plan_view(request, message_type):
    """
       Функция, которая выводит таблицу редактирования текущего (выбранного) расписания.
       На странице имеем доступ для всех дней недели и для всего расписания (всех диапазонов) в целом.
       Поэтому, функция выводит всю информацию расписания на весь год, разбитых по дням недели.
    """
    if request.user.is_authenticated():
        context = {
            'success_activation': True if message_type == 'success_activation' else False,
            'to_many_requests': True if message_type == 'to_many_requests' else False,
            'activation_link_sent': True if message_type == 'activation_link_sent' else False
        }
        context.update(get_this_user(request))
        context.update(get_all_plans(request))
        context.update(get_cur_plan(request))
        if context['cur_plan'] == 0:
            return render_to_response('plan_empty.html', context)

        context.update(get_dates_info(context['cur_plan']))
        plan_rows = PlanRows.objects.select_related().filter(plan_id=context['cur_plan'].plan.id).order_by('time')
        context['plan_rows'] = plan_rows
        # для появления кнопки добавления расписания
        context['is_plan_page'] = True
        # получить права пользователя на редактирование расписания
        context.update(get_user_plan_rights(context['user'], context['cur_plan'].plan.id))

        return render_to_response('plan.html', context)

    else:
        return HttpResponseRedirect("/login", status=401)


def statistics_view(request):
    if request.user.is_authenticated():
        user = CustomUser.objects.get(email=request.user.email)

        all_plans = UserPlans.objects.select_related().filter(user_id=user.id)
        if all_plans.count() == 0:
            return HttpResponseRedirect("/plan")

        # выбираем текущее расписание юзера
        try:
            cur_plan = UserPlans.objects.select_related().filter(user_id=user.id, always_yn='y')[0]
        except IndexError:
            cur_plan = all_plans[0]

        # plan_rows = PlanRows.objects.select_related().filter(plan_id=cur_plan.plan_id)

        stripes_dict = Stripes(cur_plan.plan_id)
        stripes_dict_json = stripes_dict.get_stripes_json()

        print(stripes_dict_json)

        return render_to_response('statistics.html', {'data': json.loads(stripes_dict_json)})

    else:
        return HttpResponseRedirect("/login", status=401)


def thank_you_page_view(request):
    if request.user.is_authenticated():
        return render_to_response('thank_you_page.html')
    else:
        return HttpResponseRedirect("/login", status=401)


def get_participants(plan):
    """
        Возвращает всех участников расписания
    """
    context = dict()
    # TODO: exclude role = elder
    participant_list = UserPlans.objects.select_related().filter(plan_id=plan.plan.id)

    context['participants'] = participant_list

    return context


def get_user_participant_rights(user, plan_id):
    context = {}
    if user.has_rights(action='leave_plan', **{'plan_id': plan_id}):
        context['user_has_leave_plan'] = True
    if user.has_rights(action='invite_participants', **{'plan_id': plan_id}):
        context['user_has_invite_participants'] = True
    if user.has_rights(action='edit_role', **{'plan_id': plan_id}):
        context['user_has_edit_role'] = True
    user_role = UserPlans.objects.get(user_id=user.id, plan_id=plan_id).role
    context['user_role'] = user_role
    return context


def participant_view(request, message_type):
    if request.user.is_authenticated():
        context = {
            'success_activation': True if message_type == 'success_activation' else False,
            'to_many_requests': True if message_type == 'to_many_requests' else False,
            'activation_link_sent': True if message_type == 'activation_link_sent' else False
        }
        context.update(get_this_user(request))
        context.update(get_all_plans(request))
        context.update(get_cur_plan(request))

        if context['cur_plan'] == 0:
            return render_to_response('plan_empty.html', context)

        context.update(get_participants(context['cur_plan']))
        context['this_user'] = request.user
        context.update(get_user_participant_rights(request.user, context['cur_plan'].plan.id))

        return render_to_response('participants.html', context)
    else:
        return HttpResponseRedirect("/login", status=401)


def about_service_view(request, message_type):
    if request.user.is_authenticated():
        context = {
            'success_activation': True if message_type == 'success_activation' else False,
            'to_many_requests': True if message_type == 'to_many_requests' else False,
            'activation_link_sent': True if message_type == 'activation_link_sent' else False
        }
        user = CustomUser.objects.get(email=request.user.email)
        context['user'] = user

        return render_to_response('about_service.html', context)
    else:
        return HttpResponseRedirect("/login", status=401)


def profile_view(request, message_type):
    if request.user.is_authenticated():
        context = {
            'success_activation': True if message_type == 'success_activation' else False,
            'to_many_requests': True if message_type == 'to_many_requests' else False,
            'activation_link_sent': True if message_type == 'activation_link_sent' else False
        }
        user = CustomUser.objects.get(email=request.user.email)
        user_plans = UserPlans.objects.select_related().filter(user_id=user.id)
        user_channels = UserMailingChannels.objects.get(user_id=user.id)

        context['user'] = user
        context['user_plans'] = user_plans
        context['user_channels'] = user_channels
        return render_to_response('account.html', context)
    else:
        return HttpResponseRedirect("/login", status=401)
