DELIMITER |

CREATE TRIGGER clean_userinfo_before_delete_trigger BEFORE DELETE ON intodayer2_app_customuser
	FOR EACH ROW BEGIN
		DELETE FROM user_plans WHERE user_id = OLD.id;
		DELETE FROM plan_lists WHERE owner_id = OLD.id;
		DELETE FROM invitations WHERE from_user = OLD.id OR to_user = OLD.id;
		DELETE FROM intodayer2_app_usermailingchannels WHERE user_id = OLD.id;
		DELETE FROM intodayer2_app_emailactivation WHERE user_id = OLD.id;
	END|

DELIMITER ;