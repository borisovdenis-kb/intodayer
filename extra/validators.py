from django.core.exceptions import ValidationError


def validate_yn_filed(value):
    if value not in ['n', 'y']:
        raise ValidationError('Fields with _yn suffix must be of "y" or "n" only')


def validate_name_filed(value):
    if len(value) < 1:
        print('Called')
        raise ValidationError('Fields first_name and last_name must be >= 1')
