# -*- coding: utf-8 -*-

# ---------------------------------------------------------------
# Для того, что бы тестировать django файлы
# Вставлять обязательно перед импортом моделей!!!
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intodayer2.settings")
django.setup()
# ---------------------------------------------------------------
from django.contrib.auth.hashers import check_password
from intodayer_bot.work_with_db import MySQLer
from intodayer_bot import config
import shelve


def set_user_state(chat_id, state=False):
    with shelve.open(config.SHELVE_NAME) as storage:
        storage[str(chat_id)] = state


def is_logging(chat_id):
    with shelve.open(config.SHELVE_NAME) as storage:
        try:
            state = storage[str(chat_id)]
            return state
        except (KeyError, EOFError):
            return None


def login(email, password):
    db = MySQLer(config.DB_PYMYSQL_PARAMS)
    user = db.get_user_by_email(email)
    if user:
        # user[1] - password
        if check_password(password, user[1]):
            return user[0]  # user id
    else:
        return None


if __name__ == '__main__':
    # print(is_logging('322530729'))
    print(login('borisovdenis-kb@yandex.ru', 'Denis8783212293'))
