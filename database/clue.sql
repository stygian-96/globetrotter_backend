CREATE TABLE clue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    clue TEXT NOT NULL,
    FOREIGN KEY (city_id) REFERENCES city(id)
);
