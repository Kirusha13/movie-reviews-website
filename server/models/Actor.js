const { query } = require('../config/database');

class Actor {
    // Получить всех актеров
    static async getAll(options = {}) {
        const { page = 1, limit = 50, search = null, sortBy = 'name', sortOrder = 'ASC' } = options;

        try {
            let sql = 'SELECT * FROM actors';
            const params = [];

            // Поиск по имени или биографии
            if (search) {
                sql += ' WHERE name LIKE ? OR biography LIKE ?';
                params.push(`%${search}%`, `%${search}%`);
            }

            // Сортировка
            const allowedSortFields = ['name', 'birth_date', 'created_at'];
            const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
            const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
            
            sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

            // Пагинация
            if (limit && page) {
                const offset = (page - 1) * limit;
                sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
            }

            const actors = await query(sql, params);

            // Получаем общее количество для пагинации
            let countSql = 'SELECT COUNT(*) as total FROM actors';
            if (search) {
                countSql += ' WHERE name LIKE ? OR biography LIKE ?';
            }
            
            const countResult = await query(countSql, search ? [`%${search}%`, `%${search}%`] : []);
            const total = countResult[0].total;

            return {
                actors,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Ошибка получения актеров: ${error.message}`);
        }
    }

    // Получить актера по ID
    static async getById(id) {
        try {
            const actors = await query('SELECT * FROM actors WHERE id = ?', [id]);
            const actor = actors[0] || null;
            return actor;
        } catch (error) {
            throw new Error(`Ошибка получения актера: ${error.message}`);
        }
    }

    // Получить актера по имени
    static async getByName(name) {
        try {
            const actors = await query('SELECT * FROM actors WHERE name = ?', [name]);
            const actor = actors[0] || null;
            return actor;
        } catch (error) {
            throw new Error(`Ошибка получения актера: ${error.message}`);
        }
    }

    // Создать нового актера
    static async create(actorData) {
        const { name, biography, birth_date, photo_url } = actorData;

        try {
            // Проверяем, что актер с таким именем еще не существует
            const existingActor = await this.getByName(name);
            if (existingActor) {
                throw new Error('Актер с таким именем уже существует');
            }

            // Проверяем валидность имени
            if (!name || name.trim().length < 2) {
                throw new Error('Имя актера должно содержать минимум 2 символа');
            }

            // Валидация даты рождения
            if (birth_date) {
                const birthDate = new Date(birth_date);
                const currentDate = new Date();
                if (birthDate > currentDate) {
                    throw new Error('Дата рождения не может быть в будущем');
                }
            }

            const result = await query(`
                INSERT INTO actors (name, biography, birth_date, photo_url)
                VALUES (?, ?, ?, ?)
            `, [
                name.trim(), 
                biography ? biography.trim() : null, 
                birth_date || null, 
                photo_url || null
            ]);

            return result.insertId;
        } catch (error) {
            throw new Error(`Ошибка создания актера: ${error.message}`);
        }
    }

    // Обновить актера
    static async update(id, actorData) {
        try {
            const { name, biography, birth_date, photo_url } = actorData;
            
            // Проверяем существование актера
            const existingActor = await this.getById(id);
            if (!existingActor) {
                throw new Error('Актер не найден');
            }

            // Если меняется имя, проверяем уникальность
            if (name && name !== existingActor.name) {
                const duplicateActor = await this.getByName(name);
                if (duplicateActor) {
                    throw new Error('Актер с таким именем уже существует');
                }
            }

            // Проверяем валидность имени
            if (name && name.trim().length < 2) {
                throw new Error('Имя актера должно содержать минимум 2 символа');
            }

            // Валидация даты рождения
            if (birth_date) {
                const birthDate = new Date(birth_date);
                const currentDate = new Date();
                if (birthDate > currentDate) {
                    throw new Error('Дата рождения не может быть в будущем');
                }
            }

            const updateFields = [];
            const params = [];

            if (name !== undefined) {
                updateFields.push('name = ?');
                params.push(name.trim());
            }

            if (biography !== undefined) {
                updateFields.push('biography = ?');
                params.push(biography ? biography.trim() : null);
            }

            if (birth_date !== undefined) {
                updateFields.push('birth_date = ?');
                params.push(birth_date || null);
            }

            if (photo_url !== undefined) {
                updateFields.push('photo_url = ?');
                params.push(photo_url || null);
            }

            if (updateFields.length === 0) {
                throw new Error('Нет данных для обновления');
            }

            params.push(id);

            await query(`
                UPDATE actors 
                SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, params);

            return true;
        } catch (error) {
            throw new Error(`Ошибка обновления актера: ${error.message}`);
        }
    }

    // Удалить актера
    static async delete(id) {
        try {
            // Проверяем существование актера
            const existingActor = await this.getById(id);
            if (!existingActor) {
                throw new Error('Актер не найден');
            }

            // Проверяем, используется ли актер в фильмах
            const moviesWithActor = await query(`
                SELECT COUNT(*) as count FROM movie_actors WHERE actor_id = ?
            `, [id]);

            if (moviesWithActor[0].count > 0) {
                throw new Error('Нельзя удалить актера, который участвует в фильмах');
            }

            await query('DELETE FROM actors WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error(`Ошибка удаления актера: ${error.message}`);
        }
    }

    // Получить фильмы актера
    static async getMovies(actorId) {
        try {
            const movies = await query(`
                SELECT 
                    m.*,
                    ma.role_name,
                    ma.is_lead
                FROM movies m
                JOIN movie_actors ma ON m.id = ma.movie_id
                WHERE ma.actor_id = ?
                ORDER BY m.release_year DESC, m.title ASC
            `, [actorId]);
            
            return movies;
        } catch (error) {
            throw new Error(`Ошибка получения фильмов актера: ${error.message}`);
        }
    }

    // Получить статистику по актерам
    static async getStats() {
        try {
            const stats = await query(`
                SELECT 
                    a.id,
                    a.name,
                    COUNT(ma.movie_id) as movie_count,
                    AVG(m.rating) as avg_rating,
                    COUNT(CASE WHEN ma.is_lead = 1 THEN 1 END) as lead_roles
                FROM actors a
                LEFT JOIN movie_actors ma ON a.id = ma.actor_id
                LEFT JOIN movies m ON ma.movie_id = m.id
                GROUP BY a.id, a.name
                ORDER BY movie_count DESC, avg_rating DESC
            `);
            return stats;
        } catch (error) {
            throw new Error(`Ошибка получения статистики актеров: ${error.message}`);
        }
    }

    // Поиск актеров
    static async search(query) {
        try {
            const actors = await query(`
                SELECT * FROM actors 
                WHERE name LIKE ? OR biography LIKE ?
                ORDER BY name ASC
            `, [`%${query}%`, `%${query}%`]);
            return actors;
        } catch (error) {
            throw new Error(`Ошибка поиска актеров: ${error.message}`);
        }
    }
}

module.exports = Actor;
