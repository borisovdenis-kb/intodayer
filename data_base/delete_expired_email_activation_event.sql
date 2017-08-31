SET GLOBAL event_scheduler = ON;

delimiter |

CREATE EVENT delete_expired_email_activation_event
    ON SCHEDULE EVERY 1 MINUTE
    ON COMPLETION PRESERVE
    DO BEGIN
	  CALL delete_expired_activation_rows_and_related_users;
	END|

delimiter;
# удалить событие
DROP EVENT `delete_expired_email_activation_event`;

# посмотреть параметры события
SELECT LAST_EXECUTED FROM `INFORMATION_SCHEMA`.`EVENTS` WHERE `EVENT_NAME` = 'delete_expired_email_activation_event';