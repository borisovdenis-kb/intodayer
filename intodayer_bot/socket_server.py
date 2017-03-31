import socket

import intodayer_bot.config as config
from intodayer_bot.bot import do_mailing

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.bind((config.MyHOST, config.MyPORT))
sock.listen(5)

while True:
    conn, addr = sock.accept()

    print('Server connected by ', addr)

    while True:
        data = conn.recv(4294967296)

        if not data:
            break

        do_mailing(data)

        conn.send("Hi, I'm telegram bot server")

    conn.close()
