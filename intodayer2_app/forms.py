from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class CustomUserCreationForm(UserCreationForm):
    phone = forms.CharField(max_length=255,
                            widget=forms.TextInput(attrs={'placeholder': 'Номер телефона',
                                                          'id': 'phone',
                                                          'required': 'required'}))
    password1 = forms.CharField(max_length=100,
                                widget=forms.PasswordInput(attrs={'placeholder': 'Пароль',
                                                                  'id': 'password1',
                                                                  'required': 'required'}))
    password2 = forms.CharField(max_length=100,
                                widget=forms.PasswordInput(attrs={'placeholder': 'Повторите пароль',
                                                                  'id': 'password2',
                                                                  'required': 'required'}))

    class Meta:
        model = User
        fields = ('username', 'password1', 'password2', 'phone')
        widgets = {'username': forms.TextInput(attrs={'placeholder': 'Имя пользователя',
                                                      'id': 'username',
                                                      'required': 'required'})}