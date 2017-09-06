CREATE DEFINER=`denisko`@`localhost` PROCEDURE `delete_expired_activation_rows`()
BEGIN
	DECLARE done INT DEFAULT 0;
    DECLARE usrid, eaid INT;
    DECLARE cur CURSOR FOR SELECT id, user_id FROM intodayer.intodayer2_app_emailactivation;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;
    
    OPEN cur;
    REPEAT
		FETCH cur INTO eaid, usrid;
        IF usrid IS NULL THEN
			DELETE FROM intodayer.intodayer2_app_emailactivation WHERE id = eaid;
		END IF;
	UNTIL done END REPEAT;
    CLOSE cur;
END