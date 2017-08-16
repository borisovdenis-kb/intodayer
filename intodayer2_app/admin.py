# -*- coding: utf-8 -*-

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from intodayer2_app.models import (
    CustomUser, Times, DaysOfWeek, Places, Subjects, Teachers,
    UserPlans, PlanLists, PlanRows, PlanRowsTemporal
)


class CustomUserAdmin(BaseUserAdmin):
    list_display = (
        'username',
        'password',
        'first_name',
        'last_name',
        'email',
        'phone',
        'avatar',
    )


class DaysOfWeekAdmin(admin.ModelAdmin):
    list_display = ('name',)


class PlacesAdmin(admin.ModelAdmin):
    list_display = ('name',)


class TimesAdmin(admin.ModelAdmin):
    list_display = ('hh24mm',)


class SubjectsAdmin(admin.ModelAdmin):
    list_display = ('name',)


class TeachersAdmin(admin.ModelAdmin):
    list_display = ('name_short',)


class PlanRowsAdmin(admin.ModelAdmin):
    list_display = (
        'time',
        'teacher',
        'place',
        'subject'
    )


class PlanRowsTemporalAdmin(admin.ModelAdmin):
    list_display = (
        'time',
        'teacher',
        'place',
        'subject'
    )


class UserPlansAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'plan',
        'current_yn',
    )


class PlanListsAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'description',
        'owner',
        'start_date',
    )


# class InvitationsAdmin(admin.ModelAdmin):
#     list_display = (
#         'plan',
#     )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Times, TimesAdmin)
admin.site.register(DaysOfWeek, DaysOfWeekAdmin)
admin.site.register(Places, PlacesAdmin)
admin.site.register(Subjects, SubjectsAdmin)
admin.site.register(Teachers, TeachersAdmin)
admin.site.register(UserPlans, UserPlansAdmin)
admin.site.register(PlanLists, PlanListsAdmin)
admin.site.register(PlanRows, PlanRowsAdmin)
admin.site.register(PlanRowsTemporal, PlanRowsTemporalAdmin)
# admin.site.register(Invitations, InvitationsAdmin)
