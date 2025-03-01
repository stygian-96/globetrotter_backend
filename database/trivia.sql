CREATE TABLE trivia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    trivia TEXT NOT NULL,
    FOREIGN KEY (city_id) REFERENCES city(id)
);
