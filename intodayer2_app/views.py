from django.contrib.auth.models import *
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import auth
from django.contrib.auth.forms import UserCreationForm
from django.template import RequestContext
from intodayer2_app.send_sms import *
from intodayer2_app.models import *


def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            new_user = form.save()
            return HttpResponseRedirect('/main')
    else:
        form = UserCreationForm()
    return render_to_response('registration.html', {'form' : form})

def home_view(request):
    """Отображает главную страницу, если пользователь
    зарегистрирован, и перебрасывает на страницу входа
    в противном случае
    """

    if request.user.is_authenticated():
        # show user info
        std_id = user.myuser.student_id
        student = Students.objects.get(id = std_id)
        group = student.grp_id
        cathedra = student.cthd_id
        table = 
        print(student)

        return render_to_response('home.html')
    else:
        return HttpResponseRedirect("/login")#render_to_response('auth.html')

def login(request):
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

def logout(request):
    auth.logout(request)
    return HttpResponseRedirect("/home")

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
