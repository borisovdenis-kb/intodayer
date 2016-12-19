from django import forms
from django.contrib.auth.forms import UserCreationForm

class EmailForm(UserCreationForm):
    email = forms.EmailField(label="email", max_length=254, widget=forms.TextInput)