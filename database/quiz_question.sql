CREATE TABLE quiz_question (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_session_id INT NOT NULL,
    city_id INT NOT NULL,
    FOREIGN KEY (quiz_session_id) REFERENCES quiz_session(id),
    FOREIGN KEY (city_id) REFERENCES city(id);
);
