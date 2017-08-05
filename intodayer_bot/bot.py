# from intodayer_bot.utils import *
from intodayer_bot.utils import set_user_state, is_logging, login
# from intodayer_bot.work_with_db import *
import telebot
from intodayer2 import config
import json

from intodayer_bot.work_with_db import MySQLer

bot = telebot.TeleBot(config.token)


@bot.message_handler(commands=['start'])
def say_welcome(message):
    """
        Функция приветствия нового пользователя
        :param message:
        :return:
    """
    db = MySQLer(config.db_config_pymysql)

    username = message.chat.first_name
    welcome_text = 'Здравствуйте, %s!\nIntodayerBot чертовски рад Вас видеть :)' % username
    login_text = 'Пожалуйста, введите через пробел логин и пароль от своей учетной записи Intodayer.\n' \
                 'Пример: neo zEoN@1999'

    bot.send_message(message.chat.id, welcome_text)

    if not db.chat_is_exist(message.chat.id):
        # вводим пользователя в режим log in
        set_user_state(message.chat.id, True)
        bot.send_message(message.chat.id, login_text)


@bot.message_handler(func=lambda message: is_logging(message.chat.id) is True)
def user_login(message):
    db = MySQLer(config.db_config_pymysql)
    error_message = "Попробуйте еще раз.\nПример: neo matrix777"
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
    except ValueError:
        raise ValueError('Send JSON string')
    except TypeError:
        raise TypeError('Send JSON string')

    # message_text = ''
    # unknown = '- ? -' + '\n'
    #
    # if data['plan_info']['title']:
    #     message_text += 'Расписание: ' + data['plan_info']['title'] + '\n'
    # else:
    #     message_text += 'Расписание: ' + unknown
    #
    # if data['plan_info']['mem_count']:
    #     message_text += 'Количество участников: ' + data['plan_info']['mem_count'] + '\n'
    # else:
    #     message_text += 'Количество участников: ' + unknown
    #
    # if data['sender_name']:
    #     message_text += 'Староста: ' + data['sender_name'] + '\n'
    # else:
    #     message_text += 'Староста: ' + unknown
    #
    # if data['text']:
    #     message_text += '\n' + '"' + data['text'] + '"' + '\n'
    # else:
    #     message_text += '\n' + '[Пустое сообщение]' + '\n'

    # делаем рассылку по списку контактов
    text = data['message']['text']

    for recp in data['recipient_list']:
        bot.send_message(recp['chat_id'], text)
        if data['message']['image']:
            with open(data['message']['image'], 'rb') as f:
                bot.send_photo(recp['chat_id'], f)


if __name__ == '__main__':
   bot.polling(none_stop=True)
