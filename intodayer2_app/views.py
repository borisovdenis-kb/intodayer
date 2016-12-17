from django.contrib.auth.models import *
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import auth
from django.contrib.auth.forms import UserCreationForm
from intodayer2_app.forms import RegistrationForm
from intodayer2_app.send_sms import *
from intodayer2_app.models import *


def welcome_view(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect("/home")
    else:
        return render_to_response('welcome.html')


def registration_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect('/login')
    else:
        form = UserCreationForm()
    context = {'form' : form}
    return render_to_response('registration.html', context)

'''
def registration_view(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect('/home')
    else:
        if request.method == 'POST':
            form = UserCreationForm(request.POST)
            if form.is_valid():
                new_user = form.save()
                return HttpResponseRedirect('/login')
        else:
            form = UserCreationForm()
        return render_to_response('reg.html')'''

def home_view(request):
    if request.user.is_authenticated():
        user = User.objects.get(username=request.user.username)
        std_id = user.myuser.student_id.id
        student = Students.objects.get(id = std_id)
        group = student.grp_id
        cathedra = student.cthd_id

        # выбираем из тиблицы расписания все записи, "нужные" данному юзеру
        # мы получили список, состоящий из строк расписания
        # далее генерируем расписание на неделю, в зависимости от номера и четности недели
        table = list(SCHEDULES.objects.filter(grp_id = group, cthd_id = cathedra))

        current_week = [[], [], [], [], [], [], []]

        for row in table:
            if row.dfwk_id._def == 'Понедельник':
                current_week[0].append(row)
            elif row.dfwk_id._def == 'Вторник':
                current_week[1].append(row)
            elif row.dfwk_id._def == 'Среда':
                current_week[2].append(row)
            elif row.dfwk_id._def == 'Четверг':
                current_week[3].append(row)
            elif row.dfwk_id._def == 'Пятница':
                current_week[4].append(row)
            elif row.dfwk_id._def == 'Суббота':
                current_week[5].append(row)
            elif row.dfwk_id._def == 'Воскресенье':
                current_week[6].append(row)

        context = {'table' : current_week,
                   'username' : user.username
        }
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
