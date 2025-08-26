-- Создание базы данных для сайта-рецензии фильмов
CREATE DATABASE IF NOT EXISTS movie_reviews_db;
USE movie_reviews_db;

-- Таблица жанров
CREATE TABLE genres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица актеров
CREATE TABLE actors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    biography TEXT,
    birth_date DATE,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица фильмов
CREATE TABLE movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    release_year INT,
    director VARCHAR(255),
    poster_url VARCHAR(500),
    trailer_url VARCHAR(500),
    duration INT, -- в минутах
    description TEXT,
    country VARCHAR(100),
    language VARCHAR(100),
    rating DECIMAL(3,1) DEFAULT 0.0, -- средняя оценка (может быть 0)
    total_reviews INT DEFAULT 0,
    status ENUM('watched', 'watchlist') DEFAULT 'watched',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица рецензий и оценок
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    reviewer_name VARCHAR(100) NOT NULL, -- 'Цеха' или 'Паша'
    rating DECIMAL(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
    review_text TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (movie_id, reviewer_name)
);

-- Таблица связи фильмов с жанрами (many-to-many)
CREATE TABLE movie_genres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE,
    UNIQUE KEY unique_movie_genre (movie_id, genre_id)
);

-- Таблица связи фильмов с актерами (many-to-many)
CREATE TABLE movie_actors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    actor_id INT NOT NULL,
    role_name VARCHAR(255), -- название роли в фильме
    is_lead BOOLEAN DEFAULT FALSE, -- главная роль или нет
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_movie_actor (movie_id, actor_id)
);

-- Таблица списка желаемых фильмов
CREATE TABLE watchlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    notes TEXT,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_watchlist_movie (movie_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_release_year ON movies(release_year);
CREATE INDEX idx_movies_rating ON movies(rating);
CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_movie_genres_movie_id ON movie_genres(movie_id);
CREATE INDEX idx_movie_genres_genre_id ON movie_genres(genre_id);
CREATE INDEX idx_movie_actors_movie_id ON movie_actors(movie_id);
CREATE INDEX idx_movie_actors_actor_id ON movie_actors(actor_id);

-- Вставка базовых жанров
INSERT INTO genres (name, description) VALUES
('Боевик', 'Фильмы с динамичными сценами и экшном'),
('Комедия', 'Юмористические фильмы'),
('Драма', 'Фильмы с глубоким эмоциональным содержанием'),
('Ужасы', 'Фильмы, вызывающие страх и напряжение'),
('Фантастика', 'Фильмы с научно-фантастическими элементами'),
('Триллер', 'Напряженные фильмы с интригой'),
('Романтика', 'Романтические фильмы'),
('Документальный', 'Документальные фильмы'),
('Анимация', 'Анимированные фильмы'),
('Криминал', 'Фильмы о преступлениях и правосудии'),
('Приключения', 'Фильмы о путешествиях и приключениях'),
('Семейный', 'Фильмы для всей семьи');

-- Триггер для обновления средней оценки фильма
DELIMITER //
CREATE TRIGGER update_movie_rating AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE movies 
    SET rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE movie_id = NEW.movie_id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE movie_id = NEW.movie_id
    )
    WHERE id = NEW.movie_id;
END//

CREATE TRIGGER update_movie_rating_update AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE movies 
    SET rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE movie_id = NEW.movie_id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE movie_id = NEW.movie_id
    )
    WHERE id = NEW.movie_id;
END//

CREATE TRIGGER update_movie_rating_delete AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE movies 
    SET rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM reviews 
        WHERE movie_id = OLD.movie_id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE movie_id = OLD.movie_id
    )
    WHERE id = OLD.movie_id;
END//
DELIMITER ;
