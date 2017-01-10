# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-12-20 01:33
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Cathedras',
            fields=[
                ('cthd_id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=128, null=True)),
            ],
            options={
                'db_table': 'cathedras',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='DayOfWeeks',
            fields=[
                ('dfwk_id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=50, null=True)),
            ],
            options={
                'db_table': 'day_of_weeks',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Faculties',
            fields=[
                ('fclt_id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                'db_table': 'faculties',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Groups',
            fields=[
                ('grp_id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('full_def', models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                'db_table': 'groups',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Schedules',
            fields=[
                ('schld_id', models.IntegerField(primary_key=True, serialize=False)),
                ('parity', models.NullBooleanField()),
                ('place', models.CharField(blank=True, max_length=50, null=True)),
                ('start_week', models.IntegerField(blank=True, null=True)),
                ('end_week', models.IntegerField(blank=True, null=True)),
                ('comment', models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                'db_table': 'schedules',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='SchedulesSpecial',
            fields=[
                ('schld_s_id', models.IntegerField(primary_key=True, serialize=False)),
                ('date_of', models.DateField(blank=True, null=True)),
                ('parity', models.NullBooleanField()),
                ('place', models.CharField(blank=True, max_length=50, null=True)),
                ('start_week', models.IntegerField(blank=True, null=True)),
                ('end_week', models.IntegerField(blank=True, null=True)),
                ('comment', models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                'db_table': 'schedules_special',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Students',
            fields=[
                ('stdt_id', models.IntegerField(primary_key=True, serialize=False)),
                ('admission_year', models.IntegerField(blank=True, null=True)),
                ('nave_date', models.DateField(blank=True, null=True)),
                ('navi_user', models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                'db_table': 'students',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Subjects',
            fields=[
                ('subj_id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=50, null=True)),
            ],
            options={
                'db_table': 'subjects',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Teachers',
            fields=[
                ('tchr_id', models.IntegerField(primary_key=True, serialize=False)),
                ('name_short', models.CharField(blank=True, max_length=255, null=True)),
                ('name_full', models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                'db_table': 'teachers',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Times',
            fields=[
                ('tms_id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=50, null=True)),
            ],
            options={
                'db_table': 'times',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Universities',
            fields=[
                ('unvr_id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                'db_table': 'universities',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(max_length=12)),
                ('delivery_yn', models.CharField(blank=True, max_length=1, null=True)),
                ('navi_date', models.DateField(blank=True, null=True)),
                ('navi_user', models.CharField(blank=True, max_length=255, null=True)),
                ('stdt_stdt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='intodayer2_app.Students')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
