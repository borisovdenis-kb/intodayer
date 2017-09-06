SET GLOBAL event_scheduler = ON;

delimiter |

CREATE EVENT delete_not_activated_users_event
    ON SCHEDULE EVERY 1 MINUTE
    ON COMPLETION PRESERVE
    DO BEGIN
	    CALL delete_not_activated_users;
	  END|

delimiter ;
# удалить событие
DROP EVENT `delete_not_activated_users_event`;

# посмотреть параметры события
SELECT LAST_EXECUTED FROM `INFORMATION_SCHEMA`.`EVENTS` WHERE `EVENT_NAME` = 'delete_not_activated_users_event';