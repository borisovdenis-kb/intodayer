# from intodayer_bot.utils import *
# from intodayer_bot.work_with_db import *
import telebot
import json
from intodayer_bot import config
from intodayer_bot.work_with_db import MySQLer
from intodayer_bot.utils import (
    set_user_state, is_logging, login
)


bot = telebot.TeleBot(config.TOKEN)


@bot.message_handler(commands=['start'])
def say_welcome(message):
    """
        Функция приветствия нового пользователя
        :param message:
        :return:
    """
    db = MySQLer(config.DB_PYMYSQL_PARAMS)

    username = message.chat.first_name
    welcome_text = 'Здравствуйте, %s!\nIntodayerBot чертовски рад Вас видеть :)' % username
    login_text = 'Пожалуйста, введите через пробел логин и пароль от своей учетной записи Intodayer.\n' \
                 'Пример: neo@matrix.com ma7tr7ix7#'

    bot.send_message(message.chat.id, welcome_text)

    if not db.chat_is_exist(message.chat.id):
        # вводим пользователя в режим log in
        set_user_state(message.chat.id, True)
        bot.send_message(message.chat.id, login_text)


@bot.message_handler(func=lambda message: is_logging(message.chat.id) is True)
def user_login(message):
    db = MySQLer(config.DB_PYMYSQL_PARAMS)
    error_message = "Попробуйте еще раз.\nПример: morpheus@zeon.com zeOn1999*"
    success_message = "Поздравляем, все прошло успешно!"

    try:
        email, password = message.text.split()
        user_id = login(email, password)

        if user_id:
            db.set_chat_id(message.chat.id, user_id)
            # выводим пользователя из режима log in
            set_user_state(message.chat.id, False)
            bot.send_message(message.chat.id, success_message)
        else:
            bot.send_message(message.chat.id, error_message)
    except ValueError:
        bot.send_message(message.chat.id, error_message)


def do_mailing(data):
    try:
        data = json.loads(data)
    except (ValueError, TypeError):
        raise ValueError('Send JSON string')

    # делаем рассылку по списку контактов
    text = data['message']['text']

    for recp in data['recipient_list']:
        bot.send_message(recp['chat_id'], text)
        if data['message']['image']:
            with open(data['message']['image'], 'rb') as f:
                bot.send_photo(recp['chat_id'], f)


if __name__ == '__main__':
   bot.polling(none_stop=True)
