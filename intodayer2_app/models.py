import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from PIL import Image
from datetime import *
from django.utils import timezone


_MAX_SIZE = 300


class DivToPng(models.Model):
    """
        Таблица для хранения изображений
        полученных при конвертации div блоков с расписанием
    """
    image = models.ImageField(upload_to='div_to_png/', blank=True, max_length=1000)

    class Meta:
        managed = True
        db_table = 'div_to_png'


class DaysOfWeek(models.Model):
    """
        Таблица дней недели
    """
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'day_of_weeks'

    def __str__(self):
        return self.name


class Places(models.Model):
    """
        Таблица аудиторий
        Фишка будет заключаться в том,
        чтобы при вторичном создании/редактировании расписания
        предлагать пользователю введенное до этого расположение аудитории.
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


class Subjects(models.Model):
    """
        Таблица предметов
        Фишка будет заключаться в том,
        чтобы при вторичном создании/редактировании расписания
        предлагать пользователю введенное до этого название предмета.
    """
    name = models.CharField(max_length=100, blank=True, null=True)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING, blank=True)

    class Meta:
        managed = True
        db_table = 'subjects'

    def __str__(self):
        return self.name


class Teachers(models.Model):
    """
        Таблица преподавателей
        Фишка будет заключаться в том,
        чтобы при вторичном создании/редактировании расписания
        предлагать пользователю введенное до этого имя преподавателя.
    """
    name_short = models.CharField(max_length=255, blank=True, null=True)
    name_full = models.CharField(max_length=255, blank=True, null=True)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING, blank=True)

    class Meta:
        managed = True
        db_table = 'teachers'

    def __str__(self):
        return self.name_short


class Times(models.Model):
    """
        Таблице хранения времени
        Фишка будет заключаться в том,
        чтобы при вторичном создании/редактировании расписания
        предлагать пользователю введенное до этого время.
    """
    hh24mm = models.TimeField()
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING, blank=True)

    class Meta:
        managed = True
        db_table = 'times'

    def get_format_time(self):
        t = self.hh24mm
        return t.strftime('%H:%M')

    def __str__(self):
        return str(self.hh24mm)


class Invitations(models.Model):
    """
        Таблица приглашений
        Эта таблица нужна, когда один пользователь захочет
        расшарить свое расписание другому пользователю.
        Пользователю, которому расшарили расписание,
        будет приходить уведомление вида:
        --- от какого Юзера пришло приглашение
        --- ссылка на рассписание, которым с ним делятся
        --- и комментарий
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
    confirmed_yn = models.CharField(max_length=1, blank=True, null=True)

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


class PlanRows(models.Model):
    """
        Таблица, в которой будет храниться основная информация
        необходимая для рассписания
    """
    parity = models.IntegerField(models.DO_NOTHING)
    day_of_week = models.ForeignKey(DaysOfWeek, models.DO_NOTHING)
    time = models.ForeignKey(Times, models.DO_NOTHING)
    subject = models.ForeignKey(Subjects, models.DO_NOTHING)
    teacher = models.ForeignKey(Teachers, models.DO_NOTHING)
    place = models.ForeignKey(Places, models.DO_NOTHING)
    start_week = models.IntegerField()
    end_week = models.IntegerField()
    comment = models.CharField(max_length=256)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)
    # subgroup = models.IntegerField(models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'plan_rows'

    def __str__(self):
        return '%s' % (
            self.plan.title
        )


class PlanRowsTemporal(models.Model):
    """
        Таблица для временного изменения расписания
    """
    parity = models.BooleanField()
    day_of_week = models.ForeignKey(DaysOfWeek, models.DO_NOTHING)
    time = models.ForeignKey(Times, models.DO_NOTHING)
    subject = models.ForeignKey(Subjects, models.DO_NOTHING)
    teacher = models.ForeignKey(Teachers, models.DO_NOTHING)
    place = models.ForeignKey(Places, models.DO_NOTHING)
    start_week = models.IntegerField()
    end_week = models.IntegerField()
    comment = models.CharField(max_length=256)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'plan_rows_tmp'

    def __str__(self):
        return '%s %s' % (
            self.plan.title
        )


class UserPlans(models.Model):
    """
        Таблица для связи многие-ко-многим
        между юзерами и рассписаниями
    """
    user = models.ForeignKey('CustomUser', models.DO_NOTHING)
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)
    current_yn = models.CharField(max_length=1, blank=False)

    class Meta:
        managed = True
        db_table = 'user_plans'

    def __str__(self):
        return '%s %s' % (
            self.user.username,
            self.plan.title,
        )


class PlanLists(models.Model):
    """
        Таблица с описанием рассписания
    """
    title = models.CharField(max_length=256)
    description = models.TextField(max_length=1000)
    start_date = models.DateTimeField()
    owner = models.ForeignKey('CustomUser', models.DO_NOTHING)
    avatar = models.ImageField(upload_to='plans_avatars/', blank=True, max_length=1000)

    class Meta:
        managed = True
        db_table = 'plan_lists'

    def get_image_url(self):
        """
            Returns the URL of the image associated with this Object.
            If an image hasn't been uploaded yet, it returns a stock image
            :returns: str -- the image url
        """
        if self.avatar and hasattr(self.avatar, 'url'):
            if os.path.exists(self.avatar.path):
                return self.avatar.url
            else:
                return '/static/images/plan_avatar_default.jpg'
        else:
            return '/static/images/plan_avatar_default.jpg'

    def __str__(self):
        return '%s %s' % (
            self.title,
            self.owner.username,
        )


class CustomUser(AbstractUser):
    """
        Расширение стандартного юзера
        Добавлено:
        --- Номер телефона
        --- Аватар
    """
    avatar = models.ImageField(upload_to='users_avatars/', blank=True, max_length=1000)
    # телефон хранится в формате +7*********
    phone = models.CharField(max_length=12, blank=True)
    # id чата с ботом в телеграме
    chat_id = models.CharField(max_length=15, blank=True)

    class Meta:
        managed = True

    def get_image_url(self):
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
            Returns user's first name and last name if exist.
            Else return username.
            To construct name use ' '.join()
            :return: str -- username (first_name + last_name or username)
        """
        if self.first_name and self.last_name:
            res = [self.first_name, self.last_name]
            return res
        else:
            res = [self.username]
            return res

    def create_default_plan(self):
        """
            Эта функцию нужна для того, чтобы при создании нового пользователя
            добавить ему дефолтное расписание.
            :return: plan_list object
        """
        new_plan = PlanLists(
            title='No name',
            description='No description',
            start_date=datetime.now(),
            owner_id=self.id
        )
        new_plan.save()

        UserPlans(user_id=self.id, plan_id=new_plan.id, current_yn='y').save()

        return new_plan

    def __str__(self):
        return '%s %s %s' % (
            self.first_name,
            self.last_name,
            self.username,
        )