import intodayer_bot.config as config
import shelve


def set_user_state(chat_id, state=False):
    """ Записываем юзера в игроки и правильный ответ в текущей игре"""
    with shelve.open(config.shelve_name) as storage:
        storage[str(chat_id)] = state


def is_logging(chat_id):
    with shelve.open(config.shelve_name) as storage:
        try:
            state = storage[str(chat_id)]
            return state
        except (KeyError, EOFError):
            return None


if __name__ == '__main__':
    print(is_logging('322530729'))
