CREATE TABLE user_answer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_question_id INT NOT NULL,
    user_id INT NOT NULL,
    user_answer_city_id INT,
    FOREIGN KEY (quiz_question_id) REFERENCES quiz_question(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (user_answer_city_id) REFERENCES city(id)
);