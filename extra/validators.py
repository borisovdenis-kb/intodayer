import re
from django.core.exceptions import ValidationError


def validate_yn_filed(value):
    """
        Checking for fields: 
            UserPlans.current_yn, Invitations.confirmed_yn, 
            UserMailingChannels.(telegram_yn, email_yn)
    """
    if value not in ['n', 'y']:
        raise ValidationError('Fields with _yn suffix must be of "y" or "n" not %s' % value)


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
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]

    if value not in correct_names:
        raise ValidationError('Day of week must be one of: [%s] not %s' % (', '.join(correct_names), value))


def validate_time_field(value):
    """
        Checking for fields: 
            Times.hh24mm
    """
    time_pattern = re.compile('^([0-1]\d|2[0-3])(:[0-5]\d)$')
    match = time_pattern.match(value)

    if not match or match.end() - match.start() != len(value):
        raise ValidationError('Time field must be in hh24mm format examples(12:24; 00:01; 23:00) not %s' % value)


def validate_email_field(value):
    """
        Checking for fields: 
            CustomUser.email, Invitations.email
    """
    email_pattern = re.compile('^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$')
    match = email_pattern.match(value)

    if not match or match.end() - match.start() != len(value):
        raise ValidationError('Email field must be some@mail.domen format ' \
                              'examples(neo@gmail.com; morpheus@yandex.ru) not %s' % value)


def validate_weeks_duration_field(value):
    """
        Checking for fields: 
            PlanRows.(start_week, end_week), PlanRowsTemporal.(start_week, end_week)
    """
    try:
        value = int(value)
    except ValueError:
        raise ValidationError('Weeks duration filed must be int not %s' % type(value))

    if value < 0 or value > 56:
        raise ValidationError('Weeks duration filed must be in range [0, 56], given value is %s' % value)


def validate_parity_field(value):
    """
        Checking for fields: 
            PlanRows.parity, PlanRowsTemporal.parity
    """
    if value not in [0, 1, None]:
        raise ValidationError('Parity field must be 0, 1 or None not %s' % value)


def validate_role_field(value):
    """
        Checking for fields: 
            UserPlans.role
    """
    if value not in ['participant', 'admin', 'elder']:
        raise ValidationError('Role field must be participant, admin or elder not %s' % value)


def validate_date_field(value):
    """
        Checking for fields: 
            PlanLists.start_date
    """
    from datetime import datetime

    if type(value) != datetime:
        raise ValidationError('Type of date fields must be datetime not %s' % type(value))


def validate_telegram_chat_id_field(value):
    """
        Checking for fields: 
            CustomUser.chat_id
    """
    try:
        value = int(value)
    except ValueError:
        raise ValidationError('Chat_id field must be numeric not %s' % type(value))

    # numeric_pattern = re.compile('^\d+$')
    # match = numeric_pattern.match(value)
    #
    # if not match or match.end() - match.start() != len(value):
    #     raise ValidationError('Chat_id field must be numeric')


def validate_phone_field(value):
    """
        Checking for fields: 
            CustomUser.phone
    """
    pass


def validate_password(value):
    """
        Not for model
        Password requirements: 
            lower case, upper case, digit, special symbols, length >= 8
    """
    password_pattern = re.compile('(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$')
    match = password_pattern.match(value)

    if not match:
        raise ValidationError('Password field must contain: lower case, upper case, digits, ' \
                              'special symbols. And be minimum 8 symbols length.')


# TODO: validate_avatar_field, validate_phone_field
