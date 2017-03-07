from django.db import models
# from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser


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
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)

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
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)

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
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)

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
    plan = models.ForeignKey('PlanLists', models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'times'

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
        Таблица для свизи многие-ко-многим
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
    owner = models.ForeignKey('CustomUser', models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'plan_lists'

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
    avatar = models.ImageField(upload_to='avatar/', blank=True, max_length=1000)
    # телефон хранится в формате +7*********
    phone = models.CharField(max_length=12, blank=True)

    class Meta:
        managed = True

    def __str__(self):
        return '%s %s %s' % (
            self.first_name,
            self.last_name,
            self.username,
        )


######################################################################################
#                           ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИ                                   #
######################################################################################

def get_rows_by_weekday(plan_id):
    """
        Задача этой функции в том, чтобы распределить
        строки рассписания по дням недели, отсортировав
        их по времени
        :param plan_id:
        :return: days
    """
    rows = PlanRows.objects.select_related().filter(plan_id=plan_id).order_by('time')

    days = {
        'monday': [],
        'tuesday': [],
        'wednesday': [],
        'thursday': [],
        'friday': [],
        'saturday': [],
        'sunday': [],
    }
    for row in rows:
        if row.day_of_week.name == 'Понедельник':
            days['monday'].append(row)
        elif row.day_of_week.name == 'Вторник':
            days['tuesday'].append(row)
        elif row.day_of_week.name == 'Среда':
            days['wednesday'].append(row)
        elif row.day_of_week.name == 'Четверг':
            days['thursday'].append(row)
        elif row.day_of_week.name == 'Пятница':
            days['friday'].append(row)
        elif row.day_of_week.name == 'Суббота':
            days['saturday'].append(row)
        elif row.day_of_week.name == 'Воскресенье':
            days['sunday'].append(row)

    return days