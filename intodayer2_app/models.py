from django.db import models
from django.contrib.auth.models import User


class Universities(models.Model):
    """Таблица университетов"""
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Faculties(models.Model):
    """Таблица факультетов"""
    name = models.CharField(max_length=255)
    unvr_id = models.ForeignKey(Universities)

    def __str__(self):
        return self.name


class Groups(models.Model):
    """Таблица групп"""
    name = models.CharField(max_length=255)
    fclt_id = models.ForeignKey(Faculties)
    full_def = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Cathedras(models.Model):
    """Таблица кафедр"""
    name = models.CharField(max_length=255)
    fclt_id = models.ForeignKey(Faculties)

    def __str__(self):
        return self.name


class Day_of_weeks(models.Model):
    """Таблица дней недели"""
    _def = models.CharField(max_length=50)

    def __str__(self):
        return self._def


class Subjects(models.Model):
    """Таблица предметов"""
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Teachers(models.Model):
    """Таблица преподавателей"""
    name_short = models.CharField(max_length=255)
    name_full = models.CharField(max_length=255)

    def __str__(self):
        return self.name_short


class SCHEDULES(models.Model):
    """Таблица расписаний"""
    grp_id = models.ForeignKey(Groups)
    cthd_id = models.ForeignKey(Cathedras)
    parity = models.DecimalField(max_digits=1, decimal_places=0)
    dfwk_id = models.ForeignKey(Day_of_weeks)
    time_of = models.TimeField()
    subj_id = models.ForeignKey(Subjects)
    tchr_id = models.ForeignKey(Teachers)
    place = models.CharField(max_length=50)

    # вот тут у меня возникает вопрос:
    # зачем нам для хранения номеров недели
    # тип varchar да еще и 255 символов??
    start_week = models.CharField(max_length=255)
    end_week = models.CharField(max_length=255)
    priority_YN = models.CharField(max_length=1)
    comment = models.CharField(max_length=255)


class Students(models.Model):
    #admission_year = models.DateField()
    admission_year = models.CharField(max_length=4)
    unvr_id = models.ForeignKey(Universities)
    fclt_id = models.ForeignKey(Faculties)
    grp_id = models.ForeignKey(Groups)
    cthd_id = models.ForeignKey(Cathedras)

    def __str__(self):
        userdef = (self.unvr_id,
                   self.fclt_id,
                   self.grp_id,
                   self.cthd_id,
                   self.admission_year,
        )
        return '%s, %s, %s, %s, %s' % userdef


class MyUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=12)
    student_id = models.ForeignKey(Students)
