const { query } = require('../config/database');

class Review {
    // Получить все рецензии для фильма
    static async getByMovieId(movieId) {
        try {
            const reviews = await query(`
                SELECT * FROM reviews 
                WHERE movie_id = ? 
                ORDER BY review_date DESC
            `, [movieId]);
            
            return reviews;
        } catch (error) {
            throw new Error(`Ошибка получения рецензий: ${error.message}`);
        }
    }

    // Получить рецензию по ID
    static async getById(id) {
        try {
            const [review] = await query('SELECT * FROM reviews WHERE id = ?', [id]);
            return review || null;
        } catch (error) {
            throw new Error(`Ошибка получения рецензии: ${error.message}`);
        }
    }

    // Создать новую рецензию
    static async create(reviewData) {
        const {
            movie_id,
            reviewer_name,
            rating,
            review_text
        } = reviewData;

        try {
            // Проверяем, что рецензия от этого рецензента еще не существует
            const existingReview = await query(`
                SELECT id FROM reviews 
                WHERE movie_id = ? AND reviewer_name = ?
            `, [movie_id, reviewer_name]);

            if (existingReview.length > 0) {
                throw new Error('Рецензия от этого рецензента уже существует');
            }

            // Проверяем валидность оценки
            if (rating < 1 || rating > 10) {
                throw new Error('Оценка должна быть от 1 до 10');
            }

            const [result] = await query(`
                INSERT INTO reviews (movie_id, reviewer_name, rating, review_text)
                VALUES (?, ?, ?, ?)
            `, [movie_id, reviewer_name, rating, review_text]);

            return result.insertId;
        } catch (error) {
            throw new Error(`Ошибка создания рецензии: ${error.message}`);
        }
    }

    // Обновить рецензию
    static async update(id, reviewData) {
        const {
            rating,
            review_text
        } = reviewData;

        try {
            // Проверяем валидность оценки
            if (rating < 1 || rating > 10) {
                throw new Error('Оценка должна быть от 1 до 10');
            }

            const [result] = await query(`
                UPDATE reviews 
                SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [rating, review_text, id]);

            if (result.affectedRows === 0) {
                throw new Error('Рецензия не найдена');
            }

            return true;
        } catch (error) {
            throw new Error(`Ошибка обновления рецензии: ${error.message}`);
        }
    }

    // Удалить рецензию
    static async delete(id) {
        try {
            const [result] = await query('DELETE FROM reviews WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                throw new Error('Рецензия не найдена');
            }

            return true;
        } catch (error) {
            throw new Error(`Ошибка удаления рецензии: ${error.message}`);
        }
    }

    // Получить статистику оценок
    static async getRatingStats(movieId = null) {
        try {
            let sql = `
                SELECT 
                    COUNT(*) as total_reviews,
                    AVG(rating) as average_rating,
                    MIN(rating) as min_rating,
                    MAX(rating) as max_rating,
                    COUNT(CASE WHEN rating >= 8 THEN 1 END) as excellent_reviews,
                    COUNT(CASE WHEN rating >= 6 AND rating < 8 THEN 1 END) as good_reviews,
                    COUNT(CASE WHEN rating >= 4 AND rating < 6 THEN 1 END) as average_reviews,
                    COUNT(CASE WHEN rating < 4 THEN 1 END) as poor_reviews
                FROM reviews
            `;

            const params = [];
            if (movieId) {
                sql += ' WHERE movie_id = ?';
                params.push(movieId);
            }

            const [stats] = await query(sql, params);
            
            return {
                ...stats,
                average_rating: parseFloat(stats.average_rating || 0).toFixed(1)
            };
        } catch (error) {
            throw new Error(`Ошибка получения статистики: ${error.message}`);
        }
    }

    // Получить рецензии по рецензенту
    static async getByReviewer(reviewerName, options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'review_date',
            sortOrder = 'DESC'
        } = options;

        try {
            const offset = (page - 1) * limit;

            // Получаем рецензии с информацией о фильмах
            const reviews = await query(`
                SELECT r.*, m.title, m.poster_url, m.release_year
                FROM reviews r
                JOIN movies m ON r.movie_id = m.id
                WHERE r.reviewer_name = ?
                ORDER BY r.${sortBy} ${sortOrder}
                LIMIT ? OFFSET ?
            `, [reviewerName, limit, offset]);

            // Получаем общее количество рецензий
            const [{ total }] = await query(`
                SELECT COUNT(*) as total
                FROM reviews 
                WHERE reviewer_name = ?
            `, [reviewerName]);

            return {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Ошибка получения рецензий рецензента: ${error.message}`);
        }
    }

    // Получить топ фильмов по оценкам
    static async getTopRated(limit = 10) {
        try {
            const movies = await query(`
                SELECT m.*, 
                       AVG(r.rating) as avg_rating,
                       COUNT(r.id) as review_count
                FROM movies m
                JOIN reviews r ON m.id = r.movie_id
                WHERE m.status = 'watched'
                GROUP BY m.id
                HAVING review_count >= 2
                ORDER BY avg_rating DESC, review_count DESC
                LIMIT ?
            `, [limit]);

            return movies.map(movie => ({
                ...movie,
                avg_rating: parseFloat(movie.avg_rating).toFixed(1)
            }));
        } catch (error) {
            throw new Error(`Ошибка получения топ фильмов: ${error.message}`);
        }
    }

    // Получить рецензии с фильтрацией
    static async getFiltered(filters = {}) {
        const {
            minRating = 0,
            maxRating = 10,
            reviewer = null,
            movieId = null,
            page = 1,
            limit = 20
        } = filters;

        try {
            let sql = `
                SELECT r.*, m.title, m.poster_url
                FROM reviews r
                JOIN movies m ON r.movie_id = m.id
                WHERE 1=1
            `;

            const params = [];

            if (minRating > 0) {
                sql += ' AND r.rating >= ?';
                params.push(minRating);
            }

            if (maxRating < 10) {
                sql += ' AND r.rating <= ?';
                params.push(maxRating);
            }

            if (reviewer) {
                sql += ' AND r.reviewer_name = ?';
                params.push(reviewer);
            }

            if (movieId) {
                sql += ' AND r.movie_id = ?';
                params.push(movieId);
            }

            sql += ' ORDER BY r.review_date DESC';

            const offset = (page - 1) * limit;
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const reviews = await query(sql, params);

            // Получаем общее количество
            let countSql = `
                SELECT COUNT(*) as total
                FROM reviews r
                JOIN movies m ON r.movie_id = m.id
                WHERE 1=1
            `;

            const countParams = params.slice(0, -2);
            if (countParams.length > 0) {
                countSql += ' AND ' + countParams.map((_, index) => {
                    if (index === 0) return 'r.rating >= ?';
                    if (index === 1) return 'r.rating <= ?';
                    if (index === 2) return 'r.reviewer_name = ?';
                    if (index === 3) return 'r.movie_id = ?';
                }).join(' AND ');
            }

            const [{ total }] = await query(countSql, countParams);

            return {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Ошибка получения отфильтрованных рецензий: ${error.message}`);
        }
    }
}

module.exports = Review;
