CREATE TABLE question (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    clue_id INT NOT NULL,
    FOREIGN KEY (city_id) REFERENCES city(id),
    FOREIGN KEY (clue_id) REFERENCES clue(id)
);
