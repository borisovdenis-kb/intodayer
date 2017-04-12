import intodayer_bot.config as config
import pymysql


class MySQLer:
    def __init__(self, database):
        self.connection = pymysql.connect(**database)

    def get_user_by_username(self, username):
        query = 'SELECT id FROM intodayer2_app_customuser ' \
                'WHERE username = "%s";' % username

        with self.connection.cursor() as cursor:
            cursor.execute(query)
            res = cursor.fetchall()

        self.connection.commit()

        try:
            return res[0][0]
        except IndexError:
            return None

    def chat_is_exist(self, chat_id):
        query = 'SELECT id FROM intodayer2_app_customuser ' \
                'WHERE chat_id = "%s";' % chat_id

        with self.connection.cursor() as cursor:
            cursor.execute(query)
            res = cursor.fetchall()

        self.connection.commit()

        return True if res else False

    def set_chat_id(self, chat_id, user_id):
        """
            Функция по id пользователя в таблице intodayer2_app_customuser
            устанавливает значение поля chat_id.
            :param user_id: object
            :param chat_id: id чата в telegram
            :return:
        """
        query = 'UPDATE intodayer2_app_customuser ' \
                'SET chat_id = "%s" ' \
                'WHERE id = "%s";' % (chat_id, user_id)

        with self.connection.cursor() as cursor:
            cursor.execute(query)

        self.connection.commit()


if __name__ == '__main__':
    if __name__ == '__main__':
        X = MySQLer(config.db_config)

        print(X.get_user_by_username('Denis'))

        print(X.chat_is_exist('pipa'))

