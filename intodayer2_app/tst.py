from datetime import datetime




if __name__ == '__main__':
    while 1:
        start = datetime(*list(map(int, input().split())))
        end = datetime(*list(map(int, input().split())))
        print(weeks_from(start, end))
