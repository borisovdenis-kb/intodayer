CREATE DEFINER=`denisko`@`localhost` PROCEDURE `delete_not_activated_users`()
BEGIN
	  DECLARE done INT DEFAULT 0;
    DECLARE usrid, eaid INT;
    DECLARE eadate DATE;
    DECLARE cur CURSOR FOR SELECT id, user_id, date FROM intodayer.intodayer2_app_emailactivation;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;
    
    OPEN cur;
    REPEAT
		FETCH cur INTO eaid, usrid, eadate;
      IF TO_DAYS(NOW()) - TO_DAYS(eadate) >= 2 THEN
			  DELETE FROM intodayer.intodayer2_app_customuser WHERE id = usrid;
		  END IF;
	  UNTIL done END REPEAT;
    CLOSE cur;
END