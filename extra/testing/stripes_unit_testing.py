# Лех, небольшой туториал.
# Этот файл нужен для того что бы над кодом проводить Unit тесты.
# Импортируешь метод или класс, который нужно протестировать.
# В метод test_something пишешь входные данные и вызываешь соответвующий метод
# или класс на этих данных.
# При выводе можно увидеть за сколько времени выполнился твой код.


import unittest
from extra.stripes_api import *


class MyTestCase(unittest.TestCase):
    def test_something(self):
        tst_intervals = [[1,1300, None], [1,2000, 0], [1, 10000, 1]]
        res = intersec(tst_intervals, 10000)
        # print(res)
        # self.assertEqual(True, False)


if __name__ == '__main__':
    unittest.main()
