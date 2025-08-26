const { query } = require('../config/database');

class Genre {
    // Получить все жанры
    static async getAll() {
        try {
            const genres = await query(`
                SELECT * FROM genres 
                ORDER BY name ASC
            `);
            return genres;
        } catch (error) {
            throw new Error(`Ошибка получения жанров: ${error.message}`);
        }
    }

    // Получить жанр по ID
    static async getById(id) {
        try {
            const genres = await query('SELECT * FROM genres WHERE id = ?', [id]);
            const genre = genres[0] || null;
            return genre;
        } catch (error) {
            throw new Error(`Ошибка получения жанра: ${error.message}`);
        }
    }

    // Получить жанр по названию
    static async getByName(name) {
        try {
            const genres = await query('SELECT * FROM genres WHERE name = ?', [name]);
            const genre = genres[0] || null;
            return genre;
        } catch (error) {
            throw new Error(`Ошибка получения жанра: ${error.message}`);
        }
    }

    // Создать новый жанр
    static async create(genreData) {
        const { name, description } = genreData;

        try {
            // Проверяем, что жанр с таким названием еще не существует
            const existingGenre = await this.getByName(name);
            if (existingGenre) {
                throw new Error('Жанр с таким названием уже существует');
            }

            // Проверяем валидность названия
            if (!name || name.trim().length < 2) {
                throw new Error('Название жанра должно содержать минимум 2 символа');
            }

            const result = await query(`
                INSERT INTO genres (name, description)
                VALUES (?, ?)
            `, [name.trim(), description ? description.trim() : null]);

            return result.insertId;
        } catch (error) {
            throw new Error(`Ошибка создания жанра: ${error.message}`);
        }
    }

    // Обновить жанр
    static async update(id, genreData) {
        try {
            const { name, description } = genreData;
            
            // Проверяем существование жанра
            const existingGenre = await this.getById(id);
            if (!existingGenre) {
                throw new Error('Жанр не найден');
            }

            // Если меняется название, проверяем уникальность
            if (name && name !== existingGenre.name) {
                const duplicateGenre = await this.getByName(name);
                if (duplicateGenre) {
                    throw new Error('Жанр с таким названием уже существует');
                }
            }

            // Проверяем валидность названия
            if (name && name.trim().length < 2) {
                throw new Error('Название жанра должно содержать минимум 2 символа');
            }

            const updateFields = [];
            const params = [];

            if (name !== undefined) {
                updateFields.push('name = ?');
                params.push(name.trim());
            }

            if (description !== undefined) {
                updateFields.push('description = ?');
                params.push(description ? description.trim() : null);
            }

            if (updateFields.length === 0) {
                throw new Error('Нет данных для обновления');
            }

            params.push(id);

            await query(`
                UPDATE genres 
                SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, params);

            return true;
        } catch (error) {
            throw new Error(`Ошибка обновления жанра: ${error.message}`);
        }
    }

    // Удалить жанр
    static async delete(id) {
        try {
            // Проверяем существование жанра
            const existingGenre = await this.getById(id);
            if (!existingGenre) {
                throw new Error('Жанр не найден');
            }

            // Проверяем, используется ли жанр в фильмах
            const moviesWithGenre = await query(`
                SELECT COUNT(*) as count FROM movie_genres WHERE genre_id = ?
            `, [id]);

            if (moviesWithGenre[0].count > 0) {
                throw new Error('Нельзя удалить жанр, который используется в фильмах');
            }

            await query('DELETE FROM genres WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error(`Ошибка удаления жанра: ${error.message}`);
        }
    }

    // Получить статистику по жанрам
    static async getStats() {
        try {
            const stats = await query(`
                SELECT 
                    g.id,
                    g.name,
                    COUNT(mg.movie_id) as movie_count,
                    AVG(m.rating) as avg_rating
                FROM genres g
                LEFT JOIN movie_genres mg ON g.id = mg.genre_id
                LEFT JOIN movies m ON mg.movie_id = m.id
                GROUP BY g.id, g.name
                ORDER BY movie_count DESC, avg_rating DESC
            `);
            return stats;
        } catch (error) {
            throw new Error(`Ошибка получения статистики жанров: ${error.message}`);
        }
    }

    // Поиск жанров
    static async search(query) {
        try {
            const genres = await query(`
                SELECT * FROM genres 
                WHERE name LIKE ? OR description LIKE ?
                ORDER BY name ASC
            `, [`%${query}%`, `%${query}%`]);
            return genres;
        } catch (error) {
            throw new Error(`Ошибка поиска жанров: ${error.message}`);
        }
    }
}

module.exports = Genre;
