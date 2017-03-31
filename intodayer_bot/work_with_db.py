import intodayer_bot.config as config
import mysql.connector as mysqldb


class MySQLer:
    def __init__(self, database):
        self.connection = mysqldb.connect(**database)
        self.cursor = self.connection.cursor()

    def get_user_by_username(self, username):
        query = 'SELECT id FROM intodayer2_app_customuser ' \
                'WHERE username = "%s";' % username

        self.cursor.execute(query)
        res = self.cursor.fetchall()

        try:
            return res[0][0]
        except IndexError:
            return None

    def chat_is_exist(self, chat_id):
        query = 'SELECT id FROM intodayer2_app_customuser ' \
                'WHERE chat_id = "%s";' % chat_id

        self.cursor.execute(query)
        res = self.cursor.fetchall()

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

        self.cursor.execute(query)
        self.connection.commit()


if __name__ == '__main__':
    if __name__ == '__main__':
        X = MySQLer(config.db_config)

        print(X.get_user_by_username('Denis'))

        print(X.chat_is_exist('pipa'))

