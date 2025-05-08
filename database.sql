CREATE DATABASE IF NOT EXISTS clickfit
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


USE clickfit;


CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL,
    password VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL,
    type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL,
    active TINYINT DEFAULT 1,
    UNIQUE KEY (email)
);


DELIMITER //
CREATE PROCEDURE IF NOT EXISTS addUser(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_type VARCHAR(255)
)
BEGIN
    INSERT INTO users (email, password, type)
    VALUES (p_email, p_password, p_type);
END //
DELIMITER ;

CALL addUser('admin@clickfit.com', 'securepassword123', 'admin');