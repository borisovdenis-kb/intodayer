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