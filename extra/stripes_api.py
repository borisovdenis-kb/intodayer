
def interval_to_array(start, end, parity=None):
    """
        Функция возвращает для заданного интервала последовательность.
        Т.е. [1-8] -> 1, 2, 3, 4, 5, 6, 7, 8 
        Т.е. [1-8] parity = 0 -> 2, 4, 6, 8
        Т.е. [1-8] parity = 1 -> 1, 3, 5, 7
    """
    if parity is not None:
        return [i for i in range(start, end + 1) if i % 2 == parity]
    else:
        return [i for i in range(start, end + 1)]


def intersec(intervals, n):
    """
        Функция пересечения произвольного количества
        промежутков недель в расписании.
        :param intervals: множество промежутков вида
            [[start, end, parity], ...]
        :return: последовательность вида: 
            n1,n2,...,ni, ni - кол-во множеств содержащих i
    """
    arr = []
    res = [0] * n

    for start, end, par in intervals:
        arr += interval_to_array(start, end, par)

    print(arr)
    for i in range(1, n+1):
        res[i-1] = arr.count(i)
        
    return res


if __name__ == '__main__':
    # A = list(map(int, input().split()))
    # B = list(map(int, input().split()))

    intervals = [[1, 13, 1], [2, 8, 0]]

    print('---', intersec(intervals, 13))
