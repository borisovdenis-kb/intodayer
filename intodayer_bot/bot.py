from intodayer_bot.utils import *
from intodayer_bot.work_with_db import *
import telebot
import intodayer_bot.config as config
import json


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
    welcome_text = 'Здравствуйте, %s!\nIntoDayerBot чертовски рад Вас видеть :)' % username
    login_text = 'Пожалуйста введите логин от своей учетной записи intodayer.'

    bot.send_message(message.chat.id, welcome_text)

    if not db.chat_is_exist(message.chat.id):
        # вводим пользователя в режим log in
        set_user_state(message.chat.id, True)
        bot.send_message(message.chat.id, login_text)


@bot.message_handler(func=lambda message: is_logging(message.chat.id) is True)
def user_login(message):
    db = MySQLer(config.db_config_pymysql)
    user_id = db.get_user_by_username(message.text)

    if user_id:
        db.set_chat_id(message.chat.id, user_id)
        # выводим пользователя из режима log in
        set_user_state(False)
        bot.reply_to(message, "Поздравляем, все прошло успешно!")
    else:
        bot.reply_to(message, "Попробуйте еще раз")


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
