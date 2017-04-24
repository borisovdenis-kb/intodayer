# Лех, небольшой туториал.
# Этот файл нужен для того что бы над кодом проводить Unit тесты.
# Импортируешь метод или класс, который нужно протестировать.
# В метод test_something пишешь входные данные и вызываешь соответвующий метод
# или класс на этих данных.
# При выводе можно увидеть за сколько времени выполнился твой код.


import unittest
from extra.stripes_api import Stripes


class MyTestCase(unittest.TestCase):
    def test_something(self):
        X = Stripes(1)
        res = X.get_stripes_json()

        # print(res)
        # self.assertEqual(True, False)


if __name__ == '__main__':
    unittest.main()
