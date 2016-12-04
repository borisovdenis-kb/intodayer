from django.db import models
from django.contrib.auth.models import User

class Universities(models.Model):
    """Таблица университетов"""
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Groups(models.Model):
    """Таблица групп"""
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Faculties(models.Model):
    """Таблица факультетов"""
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Cathedras(models.Model):
    """Таблица кафедр"""
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Students(models.Model):
    admission_year = models.DateField()
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
