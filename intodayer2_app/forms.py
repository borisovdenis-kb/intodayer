from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class CustomUserCreationForm(UserCreationForm):
    phone = forms.CharField(max_length=255)

    class Meta:
        model = User
        fields = ('username', 'password1', 'password2', 'phone',)
        widgets = {
            'username': forms.TextInput(attrs={'placeholder': 'Имя', 'id': 'username'}),
            'password1': forms.PasswordInput(attrs={'placeholder': 'Пароль', 'id': 'password1'}),
            'password2': forms.PasswordInput(attrs={'placeholder': 'Повторите пароль', 'id': 'password2'}),
            'phone': forms.TextInput(attrs={'placeholder': 'Номер телефона', 'id': 'phone'})
        }