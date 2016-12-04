from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from intodayer_app.models import *


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
                    'unvr_id',
                    'fclt_id',
                    'grp_id',
                    'cthd_id',
    )

class MyUserInLine(admin.StackedInline):
    model = MyUser
    can_delete = False
    verbose_name_plural = 'anotherData'

class UserAdmin(UserAdmin):
    inlines = (MyUserInLine,)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Students, StudentsAdmin)
admin.site.register(Universities, UniversitiesAdmin)
admin.site.register(Groups, GroupAdmin)
admin.site.register(Faculties, FacultiesAdmin)
admin.site.register(Cathedras, CathedrasAdmin)