CREATE TABLE quiz_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    time_taken INT NOT NULL,
    score INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
