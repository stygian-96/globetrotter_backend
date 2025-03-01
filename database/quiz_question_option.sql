CREATE TABLE quiz_question_option (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_question_id INT NOT NULL,
    city_id INT NOT NULL,
    is_correct BOOLEAN,
    FOREIGN KEY (quiz_question_id) REFERENCES quiz_question(id),
    FOREIGN KEY (city_id) REFERENCES city(id)
);
