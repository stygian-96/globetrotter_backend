CREATE TABLE Challenge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inviter_session_id INT NOT NULL,
    inviter_id INT NOT NULL,
    invitee_id INT,
    invitee_session_id INT,
    invite_link VARCHAR(255) NOT NULL,
    status ENUM('pending', 'accepted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inviter_session_id) REFERENCES quiz_session(id),
    FOREIGN KEY (inviter_id) REFERENCES user(id),
    FOREIGN KEY (invitee_id) REFERENCES user(id),
    FOREIGN KEY (invitee_session_id) REFERENCES quiz_session(id)
);
