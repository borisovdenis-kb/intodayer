from decouple import config

DB_PYMYSQL_PARAMS = {
    'db': config('DB_PYMYSQL_DB'),
    'user': config('DB_PYMYSQL_USER'),
    'password': config('DB_PYMYSQL_PASSWORD'),
    'host': config('DB_PYMYSQL_HOST'),
    'port': config('DB_PYMYSQL_PORT', cast=int)
}

TOKEN = config('TELEGRAM_BOT_TOKEN')

SHELVE_NAME = config('SHELVE_NAME')
