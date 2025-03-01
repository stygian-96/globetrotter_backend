CREATE TABLE fun_fact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    fun_fact TEXT NOT NULL,
    FOREIGN KEY (city_id) REFERENCES city(id)
);
