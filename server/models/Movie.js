const { query } = require('../config/database');

class Movie {
    // Получить все фильмы с пагинацией и фильтрами
    static async getAll(options = {}) {
        const {
            page = 1,
            limit = 12,
            genre = null,
            minRating = 0,
            maxRating = 10,
            search = null,
            status = null,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;

        // Проверяем безопасность поля сортировки
        const allowedSortFields = ['created_at', 'title', 'release_year', 'rating', 'duration'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        let sql = `
            SELECT DISTINCT m.*, 
                   GROUP_CONCAT(DISTINCT g.name) as genres,
                   GROUP_CONCAT(DISTINCT a.name) as actors
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            LEFT JOIN movie_actors ma ON m.id = ma.actor_id
            LEFT JOIN actors a ON ma.actor_id = a.id
        `;

        const whereConditions = [];
        const params = [];

        // Фильтр по жанру
        if (genre) {
            whereConditions.push('g.name = ?');
            params.push(genre);
        }

        // Фильтр по рейтингу
        if (minRating > 0) {
            whereConditions.push('m.rating >= ?');
            params.push(minRating);
        }
        if (maxRating < 10) {
            whereConditions.push('m.rating <= ?');
            params.push(maxRating);
        }

        // Поиск по названию
        if (search) {
            whereConditions.push('(m.title LIKE ? OR m.original_title LIKE ? OR a.name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Фильтр по статусу
        if (status) {
            whereConditions.push('m.status = ?');
            params.push(status);
        }

        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ` GROUP BY m.id ORDER BY m.${safeSortBy} ${safeSortOrder}`;

        // Добавляем пагинацию - используем прямые значения вместо параметров
        const offset = (page - 1) * limit;
        sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

        try {
            const movies = await query(sql, params);
            
            // Получаем общее количество фильмов для пагинации
            let countSql = `
                SELECT COUNT(DISTINCT m.id) as total
                FROM movies m
                LEFT JOIN movie_genres mg ON m.id = mg.movie_id
                LEFT JOIN movie_actors ma ON m.id = ma.actor_id
                LEFT JOIN genres g ON mg.genre_id = g.id
                LEFT JOIN actors a ON ma.actor_id = a.id
            `;

            if (whereConditions.length > 0) {
                countSql += ' WHERE ' + whereConditions.join(' AND ');
            }

            const countResult = await query(countSql, params);
            const total = countResult.length > 0 ? countResult[0].total : 0;

            return {
                movies: movies.map(movie => ({
                    ...movie,
                    genres: movie.genres ? movie.genres.split(',') : [],
                    actors: movie.actors ? movie.actors.split(',') : []
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('SQL Error:', error);
            throw new Error(`Ошибка получения фильмов: ${error.message}`);
        }
    }

    // Получить фильм по ID с полной информацией
    static async getById(id) {
        try {
            // Получаем основную информацию о фильме
            const [movie] = await query('SELECT * FROM movies WHERE id = ?', [id]);
            if (!movie) return null;

            // Получаем жанры
            const genres = await query(`
                SELECT g.* FROM genres g
                JOIN movie_genres mg ON g.id = mg.genre_id
                WHERE mg.movie_id = ?
            `, [id]);

            // Получаем актеров
            const actors = await query(`
                SELECT a.*, ma.role_name, ma.is_lead FROM actors a
                JOIN movie_actors ma ON a.id = ma.actor_id
                WHERE ma.movie_id = ?
                ORDER BY ma.is_lead DESC, a.name
            `, [id]);

            // Получаем рецензии
            const reviews = await query(`
                SELECT * FROM reviews WHERE movie_id = ?
                ORDER BY review_date DESC
            `, [id]);

            return {
                ...movie,
                genres,
                actors,
                reviews
            };
        } catch (error) {
            throw new Error(`Ошибка получения фильма: ${error.message}`);
        }
    }

    // Создать новый фильм
    static async create(movieData) {
        const {
            title,
            original_title,
            release_year,
            director,
            poster_url,
            trailer_url,
            duration,
            description,
            country,
            language,
            status = 'watched',
            genres = [],
            actors = []
        } = movieData;

        try {
            // Начинаем транзакцию
            const connection = await require('../config/database').getConnection();
            await connection.beginTransaction();

            try {
                // Создаем фильм
                const [result] = await connection.execute(`
                    INSERT INTO movies (title, original_title, release_year, director, 
                                     poster_url, trailer_url, duration, description, 
                                     country, language, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [title, original_title, release_year, director, poster_url, 
                     trailer_url, duration, description, country, language, status]);

                const movieId = result.insertId;

                // Добавляем жанры
                if (genres.length > 0) {
                    for (const genre of genres) {
                        let genreId;
                        if (typeof genre === 'object' && genre.name) {
                            // Если передан объект с названием, ищем или создаем жанр
                            const [existingGenre] = await connection.execute(
                                'SELECT id FROM genres WHERE name = ?',
                                [genre.name]
                            );
                            
                            if (existingGenre.length > 0) {
                                genreId = existingGenre[0].id;
                            } else {
                                // Создаем новый жанр
                                const [newGenre] = await connection.execute(
                                    'INSERT INTO genres (name) VALUES (?)',
                                    [genre.name]
                                );
                                genreId = newGenre.insertId;
                            }
                        } else {
                            genreId = genre; // Если передан ID
                        }
                        
                        await connection.execute(`
                            INSERT INTO movie_genres (movie_id, genre_id)
                            VALUES (?, ?)
                        `, [movieId, genreId]);
                    }
                }

                // Добавляем актеров
                if (actors.length > 0) {
                    for (const actor of actors) {
                        let actorId;
                        if (typeof actor === 'object' && actor.name) {
                            // Если передан объект с названием, ищем или создаем актера
                            const [existingActor] = await connection.execute(
                                'SELECT id FROM actors WHERE name = ?',
                                [actor.name]
                            );
                            
                            if (existingActor.length > 0) {
                                actorId = existingActor[0].id;
                            } else {
                                // Создаем нового актера
                                const [newActor] = await connection.execute(
                                    'INSERT INTO actors (name) VALUES (?)',
                                    [actor.name]
                                );
                                actorId = newActor.insertId;
                            }
                        } else {
                            actorId = actor; // Если передан ID
                        }
                        
                        await connection.execute(`
                            INSERT INTO movie_actors (movie_id, actor_id, role_name, is_lead)
                            VALUES (?, ?, ?, ?)
                        `, [movieId, actorId, null, false]);
                    }
                }

                await connection.commit();
                connection.release();

                return movieId;
            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            throw new Error(`Ошибка создания фильма: ${error.message}`);
        }
    }

    // Обновить фильм
    static async update(id, movieData) {
        const {
            title,
            original_title,
            release_year,
            director,
            poster_url,
            trailer_url,
            duration,
            description,
            country,
            language,
            status,
            genres = [],
            actors = []
        } = movieData;

        try {
            const connection = await require('../config/database').getConnection();
            await connection.beginTransaction();

            try {
                // Обновляем основную информацию
                await connection.execute(`
                    UPDATE movies SET 
                        title = ?, original_title = ?, release_year = ?, 
                        director = ?, poster_url = ?, trailer_url = ?, 
                        duration = ?, description = ?, country = ?, language = ?,
                        status = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [title, original_title, release_year, director, poster_url, 
                     trailer_url, duration, description, country, language, status, id]);

                // Обновляем жанры
                await connection.execute('DELETE FROM movie_genres WHERE movie_id = ?', [id]);
                if (genres.length > 0) {
                    for (const genre of genres) {
                        let genreId;
                        if (typeof genre === 'object' && genre.name) {
                            // Если передан объект с названием, ищем или создаем жанр
                            const [existingGenre] = await connection.execute(
                                'SELECT id FROM genres WHERE name = ?',
                                [genre.name]
                            );
                            
                            if (existingGenre.length > 0) {
                                genreId = existingGenre[0].id;
                            } else {
                                // Создаем новый жанр
                                const [newGenre] = await connection.execute(
                                    'INSERT INTO genres (name) VALUES (?)',
                                    [genre.name]
                                );
                                genreId = newGenre.insertId;
                            }
                        } else {
                            genreId = genre; // Если передан ID
                        }
                        
                        await connection.execute(`
                            INSERT INTO movie_genres (movie_id, genre_id)
                            VALUES (?, ?)
                        `, [id, genreId]);
                    }
                }

                // Обновляем актеров
                await connection.execute('DELETE FROM movie_actors WHERE movie_id = ?', [id]);
                if (actors.length > 0) {
                    for (const actor of actors) {
                        let actorId;
                        if (typeof actor === 'object' && actor.name) {
                            // Если передан объект с названием, ищем или создаем актера
                            const [existingActor] = await connection.execute(
                                'SELECT id FROM actors WHERE name = ?',
                                [actor.name]
                            );
                            
                            if (existingActor.length > 0) {
                                actorId = existingActor[0].id;
                            } else {
                                // Создаем нового актера
                                const [newActor] = await connection.execute(
                                    'INSERT INTO actors (name) VALUES (?)',
                                    [actor.name]
                                );
                                actorId = newActor.insertId;
                            }
                        } else {
                            actorId = actor; // Если передан ID
                        }
                        
                        await connection.execute(`
                            INSERT INTO movie_actors (movie_id, actor_id, role_name, is_lead)
                            VALUES (?, ?, ?, ?)
                        `, [id, actorId, null, false]);
                    }
                }

                await connection.commit();
                connection.release();

                return true;
            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            throw new Error(`Ошибка обновления фильма: ${error.message}`);
        }
    }

    // Получить фильмы с рецензиями для списка
    static async getAllWithReviews(options = {}) {
        const {
            page = 1,
            limit = 12,
            genre = null,
            minRating = 0,
            maxRating = 10,
            search = null,
            status = null,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;

        // Проверяем безопасность поля сортировки
        const allowedSortFields = ['created_at', 'title', 'release_year', 'rating', 'duration'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        let sql = `
            SELECT DISTINCT m.*, 
                   GROUP_CONCAT(DISTINCT g.name) as genres,
                   GROUP_CONCAT(DISTINCT a.name) as actors
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            LEFT JOIN movie_actors ma ON m.id = ma.actor_id
            LEFT JOIN actors a ON ma.actor_id = a.id
        `;

        const whereConditions = [];
        const params = [];

        // Фильтр по жанру
        if (genre) {
            whereConditions.push('g.name = ?');
            params.push(genre);
        }

        // Фильтр по рейтингу
        if (minRating > 0) {
            whereConditions.push('m.rating >= ?');
            params.push(minRating);
        }
        if (maxRating < 10) {
            whereConditions.push('m.rating <= ?');
            params.push(maxRating);
        }

        // Поиск по названию
        if (search) {
            whereConditions.push('(m.title LIKE ? OR m.original_title LIKE ? OR a.name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Фильтр по статусу
        if (status) {
            whereConditions.push('m.status = ?');
            params.push(status);
        }

        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ` GROUP BY m.id ORDER BY m.${safeSortBy} ${safeSortOrder}`;

        // Добавляем пагинацию
        const offset = (page - 1) * limit;
        sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

        try {
            const movies = await query(sql, params);
            
            // Получаем общее количество фильмов для пагинации
            let countSql = `
                SELECT COUNT(DISTINCT m.id) as total
                FROM movies m
                LEFT JOIN movie_genres mg ON m.id = mg.movie_id
                LEFT JOIN movie_actors ma ON m.id = ma.actor_id
                LEFT JOIN genres g ON mg.genre_id = g.id
                LEFT JOIN actors a ON ma.actor_id = a.id
            `;

            if (whereConditions.length > 0) {
                countSql += ' WHERE ' + whereConditions.join(' AND ');
            }

            const countResult = await query(countSql, params);
            const total = countResult.length > 0 ? countResult[0].total : 0;

            // Получаем рецензии для каждого фильма
            const moviesWithReviews = await Promise.all(movies.map(async (movie) => {
                const reviews = await query(`
                    SELECT id, reviewer_name, rating, review_text, review_date
                    FROM reviews 
                    WHERE movie_id = ?
                    ORDER BY review_date DESC
                `, [movie.id]);

                return {
                    ...movie,
                    genres: movie.genres ? movie.genres.split(',') : [],
                    actors: movie.actors ? movie.actors.split(',') : [],
                    reviews: reviews
                };
            }));

            return {
                movies: moviesWithReviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Ошибка получения фильмов с рецензиями: ${error.message}`);
        }
    }

    // Удалить фильм
    static async delete(id) {
        try {
            await query('DELETE FROM movies WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error(`Ошибка удаления фильма: ${error.message}`);
        }
    }

    // Получить фильмы из списка желаемых
    static async getWatchlist() {
        try {
            const movies = await query(`
                SELECT m.*, w.priority, w.notes, w.added_date,
                       GROUP_CONCAT(DISTINCT g.name) as genres
                FROM watchlist w
                JOIN movies m ON w.movie_id = m.id
                LEFT JOIN movie_genres mg ON m.id = mg.movie_id
                LEFT JOIN genres g ON mg.genre_id = g.id
                GROUP BY m.id
                ORDER BY 
                    CASE w.priority 
                        WHEN 'high' THEN 1 
                        WHEN 'medium' THEN 2 
                        WHEN 'low' THEN 3 
                    END,
                    w.added_date DESC
            `);

            return movies.map(movie => ({
                ...movie,
                genres: movie.genres ? movie.genres.split(',') : []
            }));
        } catch (error) {
            throw new Error(`Ошибка получения списка желаемых: ${error.message}`);
        }
    }

    // Добавить фильм в список желаемых
    static async addToWatchlist(movieId, priority = 'medium', notes = '') {
        try {
            await query(`
                INSERT INTO watchlist (movie_id, priority, notes)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    priority = VALUES(priority),
                    notes = VALUES(notes)
            `, [movieId, priority, notes]);

            // Обновляем статус фильма
            await query('UPDATE movies SET status = "watchlist" WHERE id = ?', [movieId]);

            return true;
        } catch (error) {
            throw new Error(`Ошибка добавления в список желаемых: ${error.message}`);
        }
    }

    // Убрать фильм из списка желаемых
    static async removeFromWatchlist(movieId) {
        try {
            await query('DELETE FROM watchlist WHERE movie_id = ?', [movieId]);
            
            // Обновляем статус фильма
            await query('UPDATE movies SET status = "watched" WHERE id = ?', [movieId]);

            return true;
        } catch (error) {
            throw new Error(`Ошибка удаления из списка желаемых: ${error.message}`);
        }
    }
}

module.exports = Movie;
