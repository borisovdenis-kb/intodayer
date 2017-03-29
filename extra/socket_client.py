import socket
from intodayer2 import config


def send_json(data):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind((config.BOT_HOST, config.BOT_PORT))
    sock.listen(5)

    conn, addr = sock.accept()

    sock.send(data)

    response = sock.recv(1024)
    print(response)

    sock.close()
