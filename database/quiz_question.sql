CREATE TABLE quiz_question (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_session_id INT NOT NULL,
    question_id INT NOT NULL,
    FOREIGN KEY (quiz_session_id) REFERENCES quiz_session(id),
    FOREIGN KEY (question_id) REFERENCES question(id)
);
