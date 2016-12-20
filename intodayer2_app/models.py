from django.db import models
from django.contrib.auth.models import User


class DayOfWeeks(models.Model):
    dfwk_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'day_of_weeks'

    def __str__(self):
        return self.name


class Universities(models.Model):
    unvr_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'universities'

    def __str__(self):
        return self.name

class Faculties(models.Model):
    fclt_id = models.IntegerField(primary_key=True)
    unvr_unvr = models.ForeignKey(Universities, models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'faculties'

    def __str__(self):
        return self.name


class Groups(models.Model):
    grp_id = models.IntegerField(primary_key=True)
    fclt_fclt = models.ForeignKey(Faculties, models.DO_NOTHING)
    name = models.CharField(max_length=255)
    full_def = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'groups'

    def __str__(self):
        return self.name


class Cathedras(models.Model):
    cthd_id = models.IntegerField(primary_key=True)
    fclt_fclt = models.ForeignKey(Faculties, models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=128, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cathedras'

    def __str__(self):
        return self.name


class Subjects(models.Model):
    subj_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'subjects'

    def __str__(self):
        return self.name


class Teachers(models.Model):
    tchr_id = models.IntegerField(primary_key=True)
    name_short = models.CharField(max_length=255, blank=True, null=True)
    name_full = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'teachers'

    def __str__(self):
        return self.name_short


class Times(models.Model):
    tms_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'times'

    def __str__(self):
        return self.name


class Schedules(models.Model):
    schld_id = models.IntegerField(primary_key=True)
    grp_grp = models.ForeignKey(Groups, models.DO_NOTHING, blank=True, null=True)
    cthd_cthd = models.ForeignKey(Cathedras, models.DO_NOTHING, blank=True, null=True)
    parity = models.NullBooleanField()
    dfwk_dfwk = models.ForeignKey(DayOfWeeks, models.DO_NOTHING, blank=True, null=True)
    tms_tms = models.ForeignKey(Times, models.DO_NOTHING, blank=True, null=True)
    subj_subj = models.ForeignKey(Subjects, models.DO_NOTHING, blank=True, null=True)
    tchr_tchr = models.ForeignKey(Teachers, models.DO_NOTHING, blank=True, null=True)
    place = models.CharField(max_length=50, blank=True, null=True)
    start_week = models.IntegerField(blank=True, null=True)
    end_week = models.IntegerField(blank=True, null=True)
    comment = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'schedules'

    def __str__(self):
        schd_def = (self.grp_grp_id,
                    self.cthd_cthd_id,
                    self.dfwk_dfwk_id,
                    self.subj_subj_id,
                    self.tchr_tchr_id,
                    self.place
        )
        return '%s, %s, %s, %s, %s, %s' % schd_def


class SchedulesSpecial(models.Model):
    schld_s_id = models.IntegerField(primary_key=True)
    date_of = models.DateField(blank=True, null=True)
    grp_grp = models.ForeignKey(Groups, models.DO_NOTHING, blank=True, null=True)
    cthd_cthd = models.ForeignKey(Cathedras, models.DO_NOTHING, blank=True, null=True)
    parity = models.NullBooleanField()
    dfwk = models.ForeignKey(DayOfWeeks, models.DO_NOTHING, blank=True, null=True)
    tms_tms = models.ForeignKey('Times', models.DO_NOTHING, blank=True, null=True)
    subj_subj = models.ForeignKey('Subjects', models.DO_NOTHING, blank=True, null=True)
    tchr_tchr = models.ForeignKey('Teachers', models.DO_NOTHING, blank=True, null=True)
    place = models.CharField(max_length=50, blank=True, null=True)
    start_week = models.IntegerField(blank=True, null=True)
    end_week = models.IntegerField(blank=True, null=True)
    comment = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'schedules_special'

        def __str__(self):
            schd_def = (self.grp_grp_id,
                        self.cthd_cthd_id,
                        self.date_of,
                        self.subj_subj_id,
                        self.tchr_tchr_id,
                        self.place
            )
            return '%s, %s, %s, %s, %s, %s' % schd_def


class Students(models.Model):
    stdt_id = models.IntegerField(primary_key=True)
    admission_year = models.IntegerField(blank=True, null=True)
    grp_grp = models.ForeignKey(Groups, models.DO_NOTHING, blank=True, null=True)
    cthd_cthd = models.ForeignKey(Cathedras, models.DO_NOTHING, blank=True, null=True)
    nave_date = models.DateField(blank=True, null=True)
    navi_user = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'students'

    def __str__(self):
        """
        Представление в читаемом виде модели:
        специальность, кафедра, год поступления
        """
        userdef = (self.grp_grp_id,
                   self.cthd_cthd_id,
                   self.admission_year,
        )
        return '%s, %s, %s' % userdef


class CustomUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=12)
    stdt_stdt = models.ForeignKey(Students)
    delivery_yn = models.CharField(max_length=1, blank=True, null=True)
    navi_date = models.DateField(blank=True, null=True)
    navi_user = models.CharField(max_length=255, blank=True, null=True)






'''
class DayOfWeeks(models.Model):
    """Таблица дней недели"""
    dfwk_id = models.IntegerField(primary_key=True)
    # Field def renamed because it was a Python reserved word.
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'day_of_weeks'

    def __str__(self):
        return self.name

class Universities(models.Model):
    """Таблица университетов"""
    unvr_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'universities'

    def __str__(self):
        return self.name


class Faculties(models.Model):
    """Таблица факультетов"""
    fclt_id = models.IntegerField(primary_key=True)
    unvr_unvr = models.ForeignKey(Universities, models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'faculties'

    def __str__(self):
        return self.name

class Cathedras(models.Model):
    """Таблица кафедр"""
    cthd_id = models.IntegerField(primary_key=True)
    fclt_fclt = models.ForeignKey(Faculties, models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=128, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cathedras'

    def __str__(self):
        return self.name


class Groups(models.Model):
    """Талица специальностей"""
    grp_id = models.IntegerField(primary_key=True)
    fclt_fclt = models.ForeignKey(Faculties, models.DO_NOTHING)
    name = models.CharField(max_length=255)
    full_def = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'groups'

    def __str__(self):
        return '%s, %s' % (self.name, self.full_def)


class Times(models.Model):
    """Таблица времени"""
    tms_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'times'

    def __str__(self):
        return self.name


class Subjects(models.Model):
    """Таблица предметов"""
    subj_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'subjects'

    def __str__(self):
        return self.name


class Teachers(models.Model):
    """Таблица преподавателей"""
    tchr_id = models.IntegerField(primary_key=True)
    name_short = models.CharField(max_length=255, blank=True, null=True)
    name_full = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'teachers'

    def __str__(self):
        return '%s, %s' % (self.name_short, self.name_full)


class Schedules(models.Model):
    """Таблица основного расписания"""
    schld_id = models.IntegerField(primary_key=True)
    grp_grp = models.ForeignKey(Groups, models.DO_NOTHING, blank=True, null=True)
    cthd_cthd = models.ForeignKey(Cathedras, models.DO_NOTHING, blank=True, null=True)
    parity = models.NullBooleanField()
    dfwk_dfwk = models.ForeignKey(DayOfWeeks, models.DO_NOTHING, blank=True, null=True)
    tms_tms = models.ForeignKey(Times, models.DO_NOTHING, blank=True, null=True)
    subj_subj = models.ForeignKey(Subjects, models.DO_NOTHING, blank=True, null=True)
    tchr_tchr = models.ForeignKey(Teachers, models.DO_NOTHING, blank=True, null=True)
    place = models.CharField(max_length=50, blank=True, null=True)
    start_week = models.IntegerField(blank=True, null=True)
    end_week = models.IntegerField(blank=True, null=True)
    comment = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'schedules'

    def __str__(self):
        schd_def = (self.grp_grp_id,
                    self.cthd_cthd_id,
                    self.dfwk_dfwk_id,
                    self.subj_subj_id,
                    self.tchr_tchr_id,
                    self.place
        )
        return '%s, %s, %s, %s, %s, %s' % schd_def


class SchedulesSpecial(models.Model):
    """Таблица временного рассписания"""
    schld_s_id = models.IntegerField(primary_key=True)
    date_of = models.DateField(blank=True, null=True)
    grp_grp = models.ForeignKey(Groups, models.DO_NOTHING, blank=True, null=True)
    cthd_cthd = models.ForeignKey(Cathedras, models.DO_NOTHING, blank=True, null=True)
    parity = models.NullBooleanField()
    dfwk_dfwk = models.ForeignKey(DayOfWeeks, models.DO_NOTHING, blank=True, null=True)
    tms_tms = models.ForeignKey(Times, models.DO_NOTHING, blank=True, null=True)
    subj_subj = models.ForeignKey(Subjects, models.DO_NOTHING, blank=True, null=True)
    tchr_tchr = models.ForeignKey(Teachers, models.DO_NOTHING, blank=True, null=True)
    place = models.CharField(max_length=50, blank=True, null=True)
    start_week = models.IntegerField(blank=True, null=True)
    end_week = models.IntegerField(blank=True, null=True)
    comment = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'schedules_special'

    def __str__(self):
        schd_def = (self.grp_grp_id,
                    self.cthd_cthd_id,
                    self.date_of,
                    self.subj_subj_id,
                    self.tchr_tchr_id,
                    self.place
        )
        return '%s, %s, %s, %s, %s, %s' % schd_def


class Students(models.Model):
    """Таблица, определяющая место обучения пользователя"""
    stdt_id = models.IntegerField(primary_key=True)
    admission_year = models.IntegerField(blank=True, null=True)
    grp_grp = models.ForeignKey(Groups, models.DO_NOTHING, blank=True, null=True)
    cthd_cthd = models.ForeignKey(Cathedras, models.DO_NOTHING, blank=True, null=True)
    nave_date = models.DateField(blank=True, null=True)
    navi_user = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'students'

    def __str__(self):
        """
        Представление в читаемом виде модели:
        Университет, факультет, специальность, кафедра, год поступления
        """
        userdef = (self.grp_grp_id,
                   self.cthd_cthd_id,
                   self.admission_year,
        )
        return '%s, %s, %s' % userdef


class CustomUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=12)
    stdt_stdt = models.ForeignKey(Students)
    delivery_yn = models.CharField(max_length=1, blank=True, null=True)
    navi_date = models.DateField(blank=True, null=True)
    navi_user = models.CharField(max_length=255, blank=True, null=True)


'''

'''
class Users(models.Model):
    usr_id = models.IntegerField(primary_key=True)
    stdt_stdt = models.ForeignKey(Students, models.DO_NOTHING, blank=True, null=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.IntegerField(blank=True, null=True)
    delivery_yn = models.CharField(max_length=1, blank=True, null=True)
    pass_hash = models.CharField(max_length=255, blank=True, null=True)
    navi_date = models.DateField(blank=True, null=True)
    navi_user = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'

старые модели
------------------------------------------------------------------------
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
'''