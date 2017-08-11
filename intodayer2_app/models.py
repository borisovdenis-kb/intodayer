import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime
from extra.validators import (
    validate_yn_filed, validate_not_empty_filed, validate_day_of_week_field,
    validate_role_field, validate_weeks_duration_field, validate_date_field,
    validate_time_field, validate_email_field, validate_parity_field,
    validate_telegram_chat_id_field, validate_phone_field
)


class ThereIsNoAction(Exception):
    pass


class ArgumentError(Exception):
    error_message = 'called function missing 1 argument "%s"'


class UnacceptableNewRoleValue(Exception):
    error_message = 'argument new_role must be of: participant or admin, not elder'


class InvalidActionValue(Exception):
    error_message = 'argument "action" must be of:\n' \
                    'edit_plan, leave_plan, delete_plan, invite_participants, ' \
                    'delete_participant, delete_admin or set_role'


class UpdateMixin:
    """
        An mixin that allows you to add a method for any model. 
        By inheritance.

        class ModelName(models.Model, UpdateMixin):
            ...
        obj = ModelName.objects.get(...)
        obj.update(**{field1: value1, ...})
    """
    def update(self, **kwargs):
        if self._state.adding:
            raise self.DoesNotExist

        for field, value in kwargs.items():
            setattr(self, field, value)

        self.clean_fields()
        self.save()


class DivToPng(models.Model, UpdateMixin):
    """
        Table for storing images obtained by 
        converting div blocks with a plan.
    """
    image = models.ImageField(upload_to='div_to_png/', blank=True, max_length=1000)

    class Meta:
        managed = True
        db_table = 'div_to_png'


class DaysOfWeek(models.Model, UpdateMixin):
    """
        Table that stores days of week
        in Russian (Понедельник, ..., Воскресенье) and in English (Monday, ..., Sunday)
    """
    name = models.CharField(max_length=50, blank=True, null=True, validators=[validate_day_of_week_field])

    class Meta:
        managed = True
        db_table = 'day_of_weeks'

    def __str__(self):
        return self.name


class Places(models.Model, UpdateMixin):
    """
        Table that stores the audience.
        It is necessary to output previously entered audiences 
        when editing the plan.
    """
    name = models.CharField(max_length=100)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING, blank=True)

    class Meta:
        managed = True
        db_table = 'places'

    def __str__(self):
        return '%s %s' % (
            self.name,
            self.plan.title,
        )


class Subjects(models.Model, UpdateMixin):
    """
        Table that stores subjects.
        It is necessary to output previously entered subjects
        when editing the plan.
    """
    name = models.CharField(max_length=100, blank=True, null=True)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING, blank=True)

    class Meta:
        managed = True
        db_table = 'subjects'

    def __str__(self):
        return self.name


class Teachers(models.Model, UpdateMixin):
    """
        Table that stores teachers.
        It is necessary to output previously entered teachers
        when editing the plan.
    """
    name_short = models.CharField(max_length=255, blank=True, null=True)
    name_full = models.CharField(max_length=255, blank=True, null=True)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING, blank=True)

    class Meta:
        managed = True
        db_table = 'teachers'

    def __str__(self):
        return self.name_short


class Times(models.Model, UpdateMixin):
    """
        Table that stores times.
        It is necessary to output previously entered times
        when editing the plan.
    """
    hh24mm = models.TimeField(validators=[validate_time_field])
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING, blank=True)

    class Meta:
        managed = True
        db_table = 'times'

    def get_format_time(self):
        t = self.hh24mm
        return t.strftime('%H:%M')

    def __str__(self):
        return str(self.hh24mm)


class Invitations(models.Model, UpdateMixin):
    """
        Table that stores invitations.
        This table is needed when one user wants 
        to share the created schedule with another user.
    """
    from_user = models.ForeignKey(
        'CustomUser',
        models.DO_NOTHING,
        db_column='from_user',
        related_name="invitations_from_user"
    )
    to_user = models.ForeignKey(
        'CustomUser',
        models.DO_NOTHING,
        db_column='to_user',
        related_name="invitations_to_user"
    )
    comment = models.TextField(blank=True, null=True)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)
    confirmed_yn = models.CharField(max_length=1, blank=True, null=True, validators=[validate_yn_filed])
    email = models.TextField(blank=False, validators=[validate_email_field])

    class Meta:
        managed = True
        db_table = 'invitations'
        # делает уникальным направление обмена
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return '%s %s %s' % (
            self.from_user,
            self.to_user,
            self.plan.title,
        )


class PlanRows(models.Model, UpdateMixin):
    """
        Table that stores the basic information for plan.
    """
    parity = models.IntegerField(models.DO_NOTHING, blank=True, null=True, validators=[validate_parity_field])
    day_of_week = models.ForeignKey(DaysOfWeek, models.DO_NOTHING)
    time = models.ForeignKey(Times, models.DO_NOTHING)
    subject = models.ForeignKey(Subjects, models.DO_NOTHING)
    teacher = models.ForeignKey(Teachers, models.DO_NOTHING)
    place = models.ForeignKey(Places, models.DO_NOTHING)
    start_week = models.IntegerField(validators=[validate_weeks_duration_field])
    end_week = models.IntegerField(validators=[validate_weeks_duration_field])
    comment = models.CharField(max_length=256, blank=True)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)
    # subgroup = models.IntegerField(models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'plan_rows'

    def __str__(self):
        return '%s' % (
            self.plan.title
        )


class PlanRowsTemporal(models.Model, UpdateMixin):
    """
        Do we need this table? 
        It is absolutely not used at all.
    """
    parity = models.BooleanField(validators=[validate_parity_field])
    day_of_week = models.ForeignKey(DaysOfWeek, models.DO_NOTHING)
    time = models.ForeignKey(Times, models.DO_NOTHING)
    subject = models.ForeignKey(Subjects, models.DO_NOTHING)
    teacher = models.ForeignKey(Teachers, models.DO_NOTHING)
    place = models.ForeignKey(Places, models.DO_NOTHING)
    start_week = models.IntegerField(validators=[validate_weeks_duration_field])
    end_week = models.IntegerField(validators=[validate_weeks_duration_field])
    comment = models.CharField(max_length=256)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'plan_rows_tmp'

    def __str__(self):
        return '%s %s' % (
            self.plan.title
        )


class UserPlans(models.Model, UpdateMixin):
    """
        Table that stores many2many relation of users and plans.
    """
    user = models.ForeignKey('CustomUser', models.DO_NOTHING)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)
    current_yn = models.CharField(max_length=1, blank=False, validators=[validate_yn_filed])
    role = models.CharField(max_length=12, blank=False, validators=[validate_role_field])

    class Meta:
        managed = True
        db_table = 'user_plans'

    @staticmethod
    def validate_role(role):
        if role in ['participant', 'admin', 'elder']:
            return role
        else:
            raise ValueError('role must be of: participant, admin or elder')

    def __str__(self):
        return '%s %s' % (
            self.user.username,
            self.plan.title,
        )


class PlanLists(models.Model, UpdateMixin):
    """
        Table that stores plan's info.
    """
    title = models.CharField(max_length=256, blank=False, validators=[validate_not_empty_filed])
    description = models.TextField(max_length=1000)
    start_date = models.DateTimeField(blank=True, validators=[validate_date_field])
    owner = models.ForeignKey('CustomUser', models.DO_NOTHING)
    avatar = models.ImageField(upload_to='plans_avatars/', blank=True, max_length=1000)

    class Meta:
        managed = True
        db_table = 'plan_lists'

    def delete_with_message(self, message=None):
        # mailing = IntodayerMailing(text=message)
        # mailing.send_by_plan(plan_id=self.id)
        self.delete()

    def get_avatar_url(self):
        """
            Returns the URL of the image associated with this Object.
            If an image hasn't been uploaded yet, it returns a stock image
            :returns: str -- the image url
        """
        if self.avatar and hasattr(self.avatar, 'url'):
            if os.path.exists(self.avatar.path):
                return self.avatar.url
            else:
                return '/static/images/plan_avatar_default.png'
        else:
            return '/static/images/plan_avatar_default.png'

    def count_of_users(self):
        n = UserPlans.objects.filter(plan_id=self.id).count()

        if (n % 10) in [0, 5, 6, 7, 8, 9]:
            res = '%s участников' % n
        elif (n % 10) in [2, 3, 4]:
            res = '%s участника' % n
        else:
            res = '%s участник' % n
        res = res

        return res

    def __str__(self):
        return '%s %s' % (
            self.title,
            self.owner.username,
        )


class UserMailingChannels(models.Model, UpdateMixin):
    """
        Table showing which channels the user wants to receive the mailing. 
        It is understood that the user can use more than one channel.
        If a new channel appears, then you need to add a new field <some_channel>_yn to the table.
    """
    user = models.ForeignKey('CustomUser', models.DO_NOTHING)
    email_yn = models.CharField(max_length=1, blank=False, validators=[validate_yn_filed])
    telegram_yn = models.CharField(max_length=1, blank=False, validators=[validate_yn_filed])

    class Meta:
        managed = True

    @staticmethod
    def get_telegram_recipients(plan_id):
        """
            The function for some plan returns list of users(chat_id) 
            who have chosen mailing via telegram.
            :param plan_id: id of plan
            :return: list [{'chat_id': 423232334}, {'chat_id': 23283732}, ...]
        """
        user_ids = UserPlans.objects.filter(plan_id=plan_id).values('user_id')
        user_ids = UserMailingChannels.objects.filter(telegram_yn='y', user_id__in=user_ids).values('user_id')
        recipients_telegram = list(CustomUser.objects.filter(id__in=user_ids).values('chat_id'))

        return recipients_telegram

    @staticmethod
    def get_email_recipients(plan_id):
        """
            The function for some plan returns list of users(email) 
            who have chosen mailing via telegram.
            :param plan_id: id of plan
            :return: list [{'email': morpheus@zeon.com}, {'email':trinity@matrix.com}, ...]
        """
        user_ids = UserPlans.objects.filter(plan_id=plan_id).values('user_id')
        user_ids = UserMailingChannels.objects.filter(email_yn='y', user_id__in=user_ids).values('user_id')
        recipients_telegram = list(CustomUser.objects.filter(id__in=user_ids).values('email'))

        return recipients_telegram

    def __str__(self):
        return '%s telegram(%s) email(%s)' % (
            ' '.join(self.user.get_name().values()),
            self.telegram_yn,
            self.email_yn
        )


class CustomUser(AbstractUser, UpdateMixin):
    """
        Extension of standard user model.
        Added:
        --- phone number
        --- avatar
    """
    first_name = models.CharField(max_length=30, blank=False, validators=[validate_not_empty_filed])
    last_name = models.CharField(max_length=30, blank=False, validators=[validate_not_empty_filed])
    email = models.EmailField(blank=False, validators=[validate_email_field])
    avatar = models.ImageField(upload_to='users_avatars/', blank=True, max_length=1000)
    # телефон хранится в формате +7*********
    phone = models.CharField(max_length=12, blank=True, validators=[validate_phone_field])
    # id чата с ботом в телеграме
    chat_id = models.CharField(max_length=15, blank=True, validators=[validate_telegram_chat_id_field])

    class Meta:
        managed = True

    def get_avatar_url(self):
        """
            Returns the URL of the image associated with this Object.
            If an image hasn't been uploaded yet or dose not exist on server
            it returns a stock image.
            :returns: str -- the image url
        """
        if self.avatar and hasattr(self.avatar, 'url'):
            exists = os.path.exists(self.avatar.path)
            if exists:
                return self.avatar.url
            else:
                return '/static/images/user_avatar_default.png'
        else:
            return '/static/images/user_avatar_default.png'

    def get_name(self):
        """
            Returns user's first name and last name.
            :return: dict -- {'first_name': some_str, 'last_name': some_str}
        """
        return {'first_name': self.first_name, 'last_name': self.last_name}

    def add_new_plan(self, title='No name', description='No description'):
        """
            Function that needed to add new empty plan to user.
            :return: PlanLists object
        """
        new_plan = PlanLists(
            title=title,
            description=description,
            start_date=datetime.now(),
            owner_id=self.id,
        )
        new_plan.save()

        UserPlans(user_id=self.id, plan_id=new_plan.id, role='elder').save()
        # устанавливаем это расписание текущим
        self.set_current_plan(new_plan.id)

        return new_plan

    def set_current_plan(self, plan_id):
        """
            Function for this user sets the current plan, 
            and remove the current_yn label from the previous one.
            :param plan_id: 
            :return: 
        """
        user_plans = UserPlans.objects.filter(user_id=self.id)

        for row in user_plans:
            if row.plan_id == int(plan_id):
                row.current_yn = 'y'
                row.save()
            else:
                row.current_yn = 'n'
                row.save()

    def has_rights(self, action=None, **kwargs):
        """
            The function shows user has rights or not in this plan for some action.
            :param action: <str>
                available actions
                (
                    'edit_plan', 'leave_plan', 'delete_plan', 'invite_participants',
                    'delete_participant', 'delete_admin', 'set_role'
                )
            :param kwargs:
                all possible kwargs
                * - necessary parameter
                {
                    plan_id: <int>, *
                    participant_id: <int>,
                    new_role: str [participant, admin, elder]
                }
            :return: True/False
        """
        if not action:
            raise ArgumentError(ArgumentError.error_message % 'action')

        user_role = UserPlans.objects.get(user_id=self.id, plan_id=kwargs['plan_id']).role

        if action == 'edit_plan':
            return True if user_role in ['admin', 'elder'] else False

        elif action == 'leave_plan':
            return True if user_role in ['admin', 'participant'] else False

        elif action == 'delete_plan':
            return True if user_role == 'elder' else False

        elif action == 'invite_participants':
            return True if user_role in ['admin', 'elder'] else False

        elif action == 'set_role':

            cur_part_role = UserPlans.objects.get(
                user_id=kwargs['participant_id'],
                plan_id=kwargs['plan_id']
            ).role

            if kwargs['new_role'] != 'elder':
                if user_role in ['admin', 'elder'] and cur_part_role != 'elder':
                    return True
                else:
                    return False
            else:
                raise UnacceptableNewRoleValue(UnacceptableNewRoleValue.error_message)

        elif action in 'delete_participant':
            participant_role = UserPlans.objects.get(
                user_id=kwargs['participant_id'],
                plan_id=kwargs['plan_id']
            ).role

            if user_role in ['admin', 'elder'] and participant_role != 'elder':
                return True
            else:
                return False

        else:
            raise InvalidActionValue(InvalidActionValue.error_message)

    def __str__(self):
        return '%s %s %s' % (
            self.first_name,
            self.last_name,
            self.username,
        )
