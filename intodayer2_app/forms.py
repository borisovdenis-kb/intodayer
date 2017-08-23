# -*- coding: utf-8 -*-

from django import forms
from django.contrib.auth.forms import UserCreationForm
from intodayer2_app.models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    password1 = forms.CharField(max_length=100,
                                widget=forms.PasswordInput(attrs={'id': 'inputPassword',

                                                                  'data-toggle': 'popover',
                                                                  'data-placement': 'right',
                                                                  'name': 'password',
                                                                  'class': 'form-control input-lg reg_field',
                                                                  'required': 'required',
                                                                  'validation': 'false',
                                                                  'placeholder': 'Password'}))
    password2 = forms.CharField(max_length=100,
                                widget=forms.PasswordInput(attrs={'id': 'inputPassword_re',
                                                                  'class': 'form-control input-lg reg_field',
                                                                  'required': 'required',
                                                                  'validation': 'false',
                                                                  'placeholder': 'Confirm password'}))
    email = forms.CharField(max_length=100,
                            widget=forms.EmailInput(attrs={'id': 'inputEmail',
                                                           'data-toggle': 'popover',
                                                           'data-placement': 'right',
                                                           'validation': 'false',
                                                           'autocomplete': 'off',
                                                           'class': 'form-control input-lg reg_field',
                                                           'required': 'required',
                                                           'placeholder': 'Enter email'}))

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'password1', 'password2', 'email')
        widgets = {
            'first_name': forms.TextInput(attrs={'id': 'inputFirstName',
                                                 'class': 'form-control input-lg reg_field',
                                                 'required': 'required',
                                                 'autocomplete': 'off',
                                                 'validation': 'false',
                                                 'placeholder': 'Enter first name'}),
            'last_name': forms.TextInput(attrs={'id': 'inputLastName',
                                                'class': 'form-control input-lg reg_field',
                                                'required': 'required',
                                                'autocomplete': 'off',
                                                'validation': 'false',
                                                'placeholder': 'Enter last name'}),
            'email': forms.TextInput(attrs={'id': 'inputEmail',
                                            'class': 'form-control input-lg reg_field',
                                            'required': 'required',
                                            'validation': 'false',
                                            'placeholder': 'Enter email'})
        }


class SetAvatarForm(forms.Form):
    image_file = forms.ImageField(label='')
