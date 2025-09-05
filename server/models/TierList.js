const db = require('../config/database');

class TierList {
    static async getAll() {
        try {
            console.log('Backend: Начинаем получение tier-листов...');
            
            // Получаем результат без деструктуризации
            const result = await db.query('SELECT * FROM tier_lists ORDER BY created_at DESC');
            console.log('Backend: Полный результат db.query:', result);
            console.log('Backend: Тип результата:', typeof result);
            console.log('Backend: result.length:', result.length);
            console.log('Backend: result[0]:', result[0]);
            console.log('Backend: result[1]:', result[1]);
            
            // Проверяем разные варианты
            let tierLists;
            if (Array.isArray(result)) {
                // Если result - это массив
                tierLists = result;
                console.log('Backend: result - это массив, используем напрямую');
            } else if (Array.isArray(result[0])) {
                // Если result[0] - это массив (mysql2)
                tierLists = result[0];
                console.log('Backend: result[0] - это массив (mysql2)');
            } else if (Array.isArray(result.rows)) {
                // Если result.rows - это массив
                tierLists = result.rows;
                console.log('Backend: result.rows - это массив');
            } else {
                // Если ничего не подходит, пробуем result как есть
                tierLists = result;
                console.log('Backend: используем result как есть');
            }
            
            console.log('Backend: Получено tier-листов:', tierLists);
            console.log('Backend: Тип данных:', typeof tierLists);
            console.log('Backend: Это массив?', Array.isArray(tierLists));
            console.log('Backend: Количество tier-листов:', tierLists.length);
            
            // Проверяем, что tierLists - это массив
            if (!Array.isArray(tierLists)) {
                console.error('Backend: tierLists не является массивом!');
                console.error('Backend: Значение tierLists:', JSON.stringify(tierLists));
                throw new Error(`tierLists не является массивом. Тип: ${typeof tierLists}`);
            }
            
            // Добавляем подсчет фильмов для каждого tier-листа
            const finalResult = await Promise.all(tierLists.map(async (tierList) => {
                const countResult = await db.query(`
                    SELECT COUNT(*) as movie_count
                    FROM tier_list_movies
                    WHERE tier_list_id = ?
                `, [tierList.id]);

                const movieCount = countResult[0]?.movie_count || 0;

                return {
                    ...tierList,
                    movie_count: movieCount
                };
            }));
            
            console.log('Backend: Финальный результат:', finalResult);
            return finalResult;
            
        } catch (error) {
            console.error('Backend: Ошибка получения tier-листов:', error);
            console.error('Backend: Stack trace:', error.stack);
            throw new Error(`Ошибка получения tier-листов: ${error.message}`);
        }
    }
    // ... existing code ...

    // Получить tier-лист по ID с фильмами
    static async getById(id) {
        try {
            // Получаем основную информацию о tier-листе
            const result = await db.query(
                'SELECT * FROM tier_lists WHERE id = ?',
                [id]
            );
            const tierListRows = result; // result - это массив

            if (tierListRows.length === 0) {
                throw new Error('Tier-лист не найден');
            }

            const tierList = tierListRows[0];

            // Получаем фильмы, распределенные по tier'ам
            const tierMoviesResult = await db.query(`
                SELECT 
                    tlm.*,
                    m.title,
                    m.original_title,
                    m.release_year,
                    m.poster_url,
                    m.rating
                FROM tier_list_movies tlm
                JOIN movies m ON tlm.movie_id = m.id
                WHERE tlm.tier_list_id = ?
                ORDER BY tlm.tier, tlm.position
            `, [id]);
            const tierMoviesRows = tierMoviesResult; // result - это массив

            // Группируем фильмы по tier'ам
            const tierMovies = {
                'S': [],
                'A': [],
                'B': [],
                'C': [],
                'D': [],
                'F': []
            };

            tierMoviesRows.forEach(row => {
                if (tierMovies[row.tier]) {
                    tierMovies[row.tier].push({
                        id: row.movie_id,
                        title: row.title,
                        original_title: row.original_title,
                        release_year: row.release_year,
                        poster_url: row.poster_url,
                        rating: row.rating,
                        position: row.position
                    });
                }
            });

            // Получаем фильмы для секции "Нераспределенные"
            // Показываем нераспределенные фильмы только если в tier-листе уже есть фильмы
            const hasMovies = Object.values(tierMovies).some(movies => movies.length > 0);

            let unassignedMovies = [];
            if (hasMovies) {
                const allMoviesResult = await db.query(`
                    SELECT
                        m.id,
                        m.title,
                        m.original_title,
                        m.release_year,
                        m.poster_url,
                        m.rating
                    FROM movies m
                    WHERE m.id NOT IN (
                        SELECT movie_id FROM tier_list_movies WHERE tier_list_id = ?
                    )
                    ORDER BY m.title
                `, [id]);
                unassignedMovies = allMoviesResult; // result - это массив
            }

            return {
                ...tierList,
                tierMovies,
                unassignedMovies
            };
        } catch (error) {
            throw new Error(`Ошибка получения tier-листа: ${error.message}`);
        }
    }

    static async create(name, movieIds = []) {
        try {
            // Создаем tier-лист
            const result = await db.query(
                'INSERT INTO tier_lists (name) VALUES (?)',
                [name]
            );
    
            const tierListId = result.insertId;
    
            // Если переданы ID фильмов, добавляем их в tier C
            if (movieIds.length > 0) {
                for (const movieId of movieIds) {
                    await db.query(
                        'INSERT INTO tier_list_movies (tier_list_id, movie_id, tier, position) VALUES (?, ?, ?, ?)',
                        [tierListId, movieId, 'C', 0]
                    );
                }
            }
    
            return { id: tierListId, name };
        } catch (error) {
            throw new Error(`Ошибка создания tier-листа: ${error.message}`);
        }
    }

    // Обновить название tier-листа
    static async update(id, name) {
        try {
            const result = await db.query(
                'UPDATE tier_lists SET name = ? WHERE id = ?',
                [name, id]
            );

            if (result.affectedRows === 0) {
                throw new Error('Tier-лист не найден');
            }

            return { id, name };
        } catch (error) {
            throw new Error(`Ошибка обновления tier-листа: ${error.message}`);
        }
    }

    // Удалить tier-лист
    static async delete(id) {
        try {
            const result = await db.query(
                'DELETE FROM tier_lists WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                throw new Error('Tier-лист не найден');
            }

            return true;
        } catch (error) {
            throw new Error(`Ошибка удаления tier-листа: ${error.message}`);
        }
    }

    // Добавить фильм в tier
    static async addMovie(tierListId, movieId, tier, position = 0) {
        try {
            // Проверяем, что фильм не уже в этом tier-листе
            const existingResult = await db.query(
                'SELECT id FROM tier_list_movies WHERE tier_list_id = ? AND movie_id = ?',
                [tierListId, movieId]
            );
            const existing = existingResult; // result - это массив

            if (existing.length > 0) {
                throw new Error('Фильм уже добавлен в этот tier-лист');
            }

            // Добавляем фильм
            await db.query(
                'INSERT INTO tier_list_movies (tier_list_id, movie_id, tier, position) VALUES (?, ?, ?, ?)',
                [tierListId, movieId, tier, position]
            );

            return true;
        } catch (error) {
            throw new Error(`Ошибка добавления фильма: ${error.message}`);
        }
    }

    // Обновить позицию фильма
    static async updateMoviePosition(tierListId, movieId, tier, position) {
        try {
            const result = await db.query(
                'UPDATE tier_list_movies SET tier = ?, position = ? WHERE tier_list_id = ? AND movie_id = ?',
                [tier, position, tierListId, movieId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Фильм не найден в tier-листе');
            }

            return true;
        } catch (error) {
            throw new Error(`Ошибка обновления позиции фильма: ${error.message}`);
        }
    }

    // Удалить фильм из tier-листа
    static async removeMovie(tierListId, movieId) {
        try {
            const result = await db.query(
                'DELETE FROM tier_list_movies WHERE tier_list_movies.tier_list_id = ? AND tier_list_movies.movie_id = ?',
                [tierListId, movieId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Фильм не найден в tier-листе');
            }

            return true;
        } catch (error) {
            throw new Error(`Ошибка удаления фильма: ${error.message}`);
        }
    }
}

module.exports = TierList;