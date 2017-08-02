import re
from django.core.exceptions import ValidationError


def validate_yn_filed(value):
    """
        Checking for fields: 
            UserPlans.current_yn, Invitations.confirmed_yn, 
            UserMailingChannels.(telegram_yn, email_yn)
    """
    if value not in ['n', 'y']:
        raise ValidationError('Fields with _yn suffix must be of "y" or "n" only')


def validate_not_empty_filed(value):
    """
        Checking for fields: 
            CustomUser.(first_name, last_name), PlanLists.title
    """
    if not value:
        raise ValidationError('Field can not be empty')


def validate_day_of_week_field(value):
    """
        Checking for fields: 
            DaysOfWeek.name
    """
    correct_names = [
        'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье',
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ]

    if value not in correct_names:
        raise ValidationError('Day of week must be of: %s' % ' '.join(correct_names))


def validate_time_field(value):
    """
        Checking for fields: 
            Times.hh24mm
    """
    time_pattern = re.compile('^([0-1]\d|2[0-3])(:[0-5]\d)$')
    match = time_pattern.match(value)

    if not match or match.end() - match.start() != len(value):
        raise ValidationError('Time field must be in hh24mm format examples(12:24; 00:01; 23:00)')


def validate_email_field(value):
    """
        Checking for fields: 
            CustomUser.email, Invitations.email
    """
    email_pattern = re.compile('^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$')
    match = email_pattern.match(value)

    if not match or match.end() - match.start() != len(value):
        raise ValidationError('Email field must be some@mail.domen format examples(neo@gmail.com; morpheus@yandex.ru)')


def validate_weeks_duration_field(value):
    try:
        value = int(value)
    except ValueError:
        raise ValidationError('Weeks duration filed must be int')

    if value < 0 or value > 56:
        raise ValidationError('Weeks duration filed must be in range [0, 56]')
