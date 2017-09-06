delimiter |

CREATE EVENT delete_expired_activation_rows_event
    ON SCHEDULE EVERY 1 WEEK
    ON COMPLETION PRESERVE
    DO BEGIN
	    CALL delete_expired_activation_rows;
	  END|

delimiter ;
# удалить событие
DROP EVENT `delete_not_activated_users_event`;

# посмотреть параметры события
SELECT LAST_EXECUTED FROM `INFORMATION_SCHEMA`.`EVENTS` WHERE `EVENT_NAME` = 'delete_expired_activation_rows_event';