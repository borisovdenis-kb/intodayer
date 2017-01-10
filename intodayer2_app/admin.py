from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from intodayer2_app.models import *

class DayOfWeeksAdmin(admin.ModelAdmin):
    list_display = ('name',)

class TimesAdmin(admin.ModelAdmin):
    list_display = ('name',)

class SubjectsAdmin(admin.ModelAdmin):
    list_display = ('name',)

class TeachersAdmin(admin.ModelAdmin):
    list_display = ('name_short',)

class SchedulesAdmin(admin.ModelAdmin):
    list_display = ('grp_grp_id',
                    'cthd_cthd_id',
    )
class SchedulesSpecialAdmin(admin.ModelAdmin):
    list_display = ('grp_grp_id',
                    'cthd_cthd_id',
                    'date_of',
    )

class UniversitiesAdmin(admin.ModelAdmin):
    list_display = ('name',)

class GroupAdmin(admin.ModelAdmin):
    list_display = ('name',)

class FacultiesAdmin(admin.ModelAdmin):
    list_display = ('name',)

class CathedrasAdmin(admin.ModelAdmin):
    list_display = ('name',)

class StudentsAdmin(admin.ModelAdmin):
    list_display = ('admission_year',
                    'grp_grp_id',
                    'cthd_cthd_id',
    )

class MyUserInLine(admin.StackedInline):
    model = CustomUser
    can_delete = False
    verbose_name_plural = 'anotherData'

class UserAdmin(UserAdmin):
    inlines = (MyUserInLine,)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Students, StudentsAdmin)
admin.site.register(Times, TimesAdmin)
admin.site.register(Universities, UniversitiesAdmin)
admin.site.register(Groups, GroupAdmin)
admin.site.register(Faculties, FacultiesAdmin)
admin.site.register(Cathedras, CathedrasAdmin)
admin.site.register(DayOfWeeks, DayOfWeeksAdmin)
admin.site.register(Subjects, SubjectsAdmin)
admin.site.register(Teachers, TeachersAdmin)
admin.site.register(Schedules, SchedulesAdmin)
admin.site.register(SchedulesSpecial, SchedulesSpecialAdmin)
