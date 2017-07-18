from django.contrib.auth.models import *
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import HttpResponseBadRequest
from django.shortcuts import render_to_response
from apis.planAPI import *
from extra.stripes_api import *
from extra.utils import *
from intodayer2_app.forms import *
from intodayer2_app.send_sms import *


# TODO: Сделать в выводе расписания в /plan сортировку по времени, а не по неделям

# TODO: Сделать аутентификацию по почте, а не по логину. Значит нужно сделать и подтверждение email


###################################################################################
#                          ОБРАБОТКА AJAX ЗАПРОСОВ                                #
###################################################################################

def switch_plan_only_set_ajax(request):
    """" 
        Данная функция просто меняет current_plan в БД и возвращает success
    """
    if request.is_ajax:
        user = CustomUser.objects.get(username=request.user.username)

        try:
            select_id = int(request.POST['select_id'])
        except ValueError:
            return render_to_response('templates_for_ajax/content_errors.html')
        except IndexError:
            return render_to_response('templates_for_ajax/content_errors.html')

        user.set_current_plan(select_id)

        response = HttpResponse()
        response['Content-Type'] = 'application/json'
        response.write(json.dumps({}))

        return response


# Почему-то не получается перенести эту функцию в planSettingsApi
def get_settings_plan_html(request):
    if request.is_ajax():
        context = dict()
        context.update(get_cur_plan(request))
        return render_to_response('templates_for_ajax/settings_ajax.html', context)


def mailing_ajax(request):
    """
        Функция получается данные от клиента и вызывает функцию расслыки
        do_mailing
        :param request:
        :return:
    """
    # TODO: Где Валидация, Денис?!?!
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)

        response = HttpResponse()
        response['Content-Type'] = 'application/json'

        mailing = IntodayerMailing(
            user.id,
            request.POST['plan_id'],
            request.POST['image'],
            request.POST['text'],
        )
        # совершаем рассылку
        mailing.send()

        response.write(json.dumps({'success': 1}))

        return response


def edit_plan_row_ajax(request):
    """
        1. Главная фукнция создания и обновления расписания
        2. Взависимости от поданой id фукнция определяет обновление или создание строки
        3. Обрабатывает разные виды исключений, чтобы распознать действия в jquery
    :param request:
    :return:
    """
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)
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
        user = CustomUser.objects.get(username=request.user.username)
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
            user = CustomUser.objects.get(username=request.user.username)
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
            user = CustomUser.objects.get(username=request.user.username)

            try:
                plan_id = int(request.POST['plan_id'])
                context.update(get_cur_plan(request, plan_id))
            except ValueError:
                return render_to_response('templates_for_ajax/content_errors.html')
            except IndexError:
                return render_to_response('templates_for_ajax/content_errors.html')

            context.update(get_dates_info(context['cur_plan']))
            # устанавливаем current_yn для созданного расписания
            plan_id = context['cur_plan'].plan_id
            user.set_current_plan(plan_id)

            return render_to_response('content_pages/right_content_home.html', context, status=200)
        else:
            return HttpResponse(status=401)
    else:
        return HttpResponse(status=400)


def switch_plan_plan_ajax(request):
    """
        Функция для переключения между расписаниями со страницы /plan
        :param request:
        :return: Отрендеренная html разметка расписания
    """
    if request.is_ajax:
        user = CustomUser.objects.get(username=request.user.username)
        context = dict()

        try:
            plan_id = int(request.POST['plan_id'])
            context.update(get_cur_plan(request, plan_id))
        except ValueError:
            return render_to_response('templates_for_ajax/content_errors.html')
        except IndexError:
            return render_to_response('templates_for_ajax/content_errors.html')

        context.update(get_dates_info(context['cur_plan']))
        # устанавливаем current_yn
        user.set_current_plan(plan_id)
        plan_rows = PlanRows.objects.select_related().filter(plan_id=plan_id).order_by('start_week')
        context['plan_rows'] = plan_rows

        return render_to_response('content_pages/right_content_plan_general.html', context)


def right_plan_content_only(request):
    """
        Загружает правый контент (без учёта Title блока), только контент расписания
    """
    if request.is_ajax:
        user = CustomUser.objects.get(username=request.user.username)
        context = dict()

        try:
            plan_id = int(request.POST['plan_id'])
            context.update(get_cur_plan(request, plan_id))
        except ValueError:
            return render_to_response('templates_for_ajax/content_errors.html')
        except IndexError:
            return render_to_response('templates_for_ajax/content_errors.html')

        context.update(get_dates_info(context['cur_plan']))
        # устанавливаем current_yn
        user.set_current_plan(plan_id)
        plan_rows = PlanRows.objects.select_related().filter(plan_id=plan_id).order_by('start_week')
        context['plan_rows'] = plan_rows

        return render_to_response('content_pages/right_content_plan.html', context)


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

        return render_to_response('templates_for_ajax/invitations.html', context)


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
        response['Content-Type'] = 'application/json'
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
        response['Content-Type'] = 'application/json'

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
        if request.user.is_authenticated():
            user = CustomUser.objects.get(username=request.user.username)

            try:
                # если user имеет права редактирования
                plan = PlanLists.objects.get(id=plan_id, owner=user.id)
            except ObjectDoesNotExist:
                return HttpResponse(status=403)

            # удаляем предыдущую аватарку
            plan.avatar.delete()
            # сохраняем новую
            plan.avatar = request.FILES['avatar']
            plan.save()

            return HttpResponse(status=200)
        else:
            return HttpResponse(status=401)
    else:
        return HttpResponse(status=400)


def get_avatar_ajax(request):
    if request.is_ajax():
        user = CustomUser.objects.get(username=request.user.username)

        response = HttpResponse()
        response['Content-Type'] = 'application/json'

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

# def plan_empty(request):
#     context = dict()
#     context.update(get_all_plans(request))
#     return render_to_response('plan_empty.html', context)


def statistics_view(request):
    if request.user.is_authenticated():
        user = CustomUser.objects.get(username=request.user.username)

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
        return HttpResponseRedirect("/login")


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
            new_user = form.save()
            # добавляем пользователю дефолтное расписание
            new_user.add_new_plan()

            return HttpResponseRedirect('/login')
    else:
        form = CustomUserCreationForm()

    context = {'form': form}
    return render_to_response('reg.html', context)


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
                return HttpResponse('User is not active')
        else:
            return HttpResponse('Invalid Login or Password')
    else:
        return render_to_response('login.html')


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


def get_all_plans(request):
    """
    Возвращает контекст со списком всех расписаний
    """
    context = dict()
    user = CustomUser.objects.get(username=request.user.username)

    all_plans = UserPlans.objects.select_related().filter(user_id=user.id)
    if all_plans.count() > 0:
        context['select_flag'] = True
    context['all_plans'] = all_plans

    return context


# TODO: Какая-то стремная функция зачем она вообще нужна??
def get_cur_plan(request, plan_id=None):
    """
        Возвращает контекст с текущим выбранным расписанием
        или формирует страницу, если такой отсутствует
    """
    context = dict()
    user = CustomUser.objects.get(username=request.user.username)

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
    this_start_date = datetime.strftime(this_start_date, "%d.%m.%y")
    context['day_of_weeks'] = day_of_weeks
    context['start_date'] = this_start_date

    return context


def get_this_user(request):
    """
        Возвращает контекст с текущим пользователем
    """
    user = CustomUser.objects.get(username=request.user.username)
    context = dict()
    context['user'] = user
    return context


def home_view(request):
    """
        Функция отображения главной страницы сайта
        с расписанием на сегодня
    """
    if request.user.is_authenticated():
        context = dict()
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
        return HttpResponseRedirect("/login", {})


def plan_view(request):
    """
       Функция, которая выводит таблицу редактирования текущего (выбранного) расписания.
       На странице имеем доступ для всех дней недели и для всего расписания (всех диапазонов) в целом.
       Поэтому, функция выводит всю информацию расписания на весь год, разбитых по дням недели.
   """
    if request.user.is_authenticated():
        context = dict()
        context.update(get_this_user(request))
        context.update(get_all_plans(request))
        context.update(get_cur_plan(request))
        if context['cur_plan'] == 0:
            return render_to_response('plan_empty.html', context)

        context.update(get_dates_info(context['cur_plan']))
        plan_rows = PlanRows.objects.select_related().filter(plan_id=context['cur_plan'].plan.id).order_by('start_week')
        context['plan_rows'] = plan_rows
        # для появления кнопки добавления расписания
        context['is_plan_page'] = True
        print(context['is_plan_page'])

        return render_to_response('plan.html', context)

    else:
        return HttpResponseRedirect("/login", {})


def sort_by_start_date(row):
    return row.start_week
