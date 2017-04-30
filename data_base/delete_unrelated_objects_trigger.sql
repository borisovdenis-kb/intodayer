DELIMITER |

CREATE TRIGGER del_unrelated_elements_after_update AFTER UPDATE ON plan_rows
	FOR EACH ROW BEGIN
		IF OLD.teacher_id NOT IN (SELECT teacher_id FROM plan_rows WHERE plan_id = OLD.plan_id) THEN
			DELETE FROM teachers WHERE id = OLD.teacher_id AND plan_id = OLD.plan_id;
		END IF;
        
        IF OLD.place_id NOT IN (SELECT place_id FROM plan_rows WHERE plan_id = OLD.plan_id) THEN
			DELETE FROM places WHERE id = OLD.place_id AND plan_id = OLD.plan_id;
		END IF;
        
        IF OLD.subject_id NOT IN (SELECT subject_id FROM plan_rows WHERE plan_id = OLD.plan_id) THEN
			DELETE FROM subjects WHERE id = OLD.subject_id AND plan_id = OLD.plan_id;
		END IF;
        
        IF OLD.time_id NOT IN (SELECT time_id FROM plan_rows WHERE plan_id = OLD.plan_id) THEN
			DELETE FROM times WHERE id = OLD.time_id AND plan_id = OLD.plan_id;
		END IF;
	END|

DELIMITER ;

DELIMITER |

CREATE TRIGGER del_unrelated_elements_after_delete AFTER DELETE ON plan_rows
	FOR EACH ROW BEGIN
		IF OLD.teacher_id NOT IN (SELECT teacher_id FROM plan_rows WHERE plan_id = OLD.plan_id) THEN
			DELETE FROM teachers WHERE id = OLD.teacher_id AND plan_id = OLD.plan_id;
		END IF;
        
        IF OLD.place_id NOT IN (SELECT place_id FROM plan_rows WHERE plan_id = OLD.plan_id) THEN
			DELETE FROM places WHERE id = OLD.place_id AND plan_id = OLD.plan_id;
		END IF;
        
        IF OLD.subject_id NOT IN (SELECT subject_id FROM plan_rows WHERE plan_id = OLD.plan_id) THEN
			DELETE FROM subjects WHERE id = OLD.subject_id AND plan_id = OLD.plan_id;
		END IF;
        
        IF OLD.time_id NOT IN (SELECT time_id FROM plan_rows WHERE plan_id = OLD.plan_id) THEN
			DELETE FROM times WHERE id = OLD.time_id AND plan_id = OLD.plan_id;
		END IF;
	END|

DELIMITER ;