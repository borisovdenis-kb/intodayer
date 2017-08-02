from django.core.exceptions import ValidationError


def validate_integer_field(value):
    if type(value) is not int:
        raise ValidationError


def validate_yn_filed(value):
    if value not in ['n', 'y']:
        raise ValidationError
