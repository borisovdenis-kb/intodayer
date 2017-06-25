
# после удаления расписания из таблицы plan_list из базы удаляются любые упоменания об этом расписании.
# Т.е. мы удаляем это рассписание на совсем, без мозможности восстановить.

DELIMITER |

CREATE TRIGGER clean_planinfo_before_delete_planlist_trigger BEFORE DELETE ON plan_lists
	FOR EACH ROW BEGIN
		DELETE FROM user_plans WHERE plan_id = OLD.id;
		DELETE FROM plan_rows WHERE plan_id = OLD.id;
    DELETE FROM times WHERE plan_id = OLD.id;
		DELETE FROM places WHERE plan_id = OLD.id;
		DELETE FROM subjects WHERE plan_id = OLD.id;
		DELETE FROM teachers WHERE plan_id = OLD.id;
	END|

DELIMITER ;