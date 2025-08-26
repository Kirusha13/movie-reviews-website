const Review = require('../models/Review');
const Movie = require('../models/Movie');

// Получить все рецензии для фильма
const getReviewsByMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const reviews = await Review.getByMovieId(parseInt(movieId));

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Ошибка получения рецензий:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения рецензий',
            error: error.message
        });
    }
};

// Получить рецензию по ID
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.getById(parseInt(id));

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Рецензия не найдена'
            });
        }

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Ошибка получения рецензии:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения рецензии',
            error: error.message
        });
    }
};

// Создать новую рецензию
const createReview = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { reviewer_name, rating, review_text } = req.body;

        // Отладочная информация
        console.log('Получены данные рецензии:', {
            movieId,
            reviewer_name,
            reviewer_name_type: typeof reviewer_name,
            reviewer_name_length: reviewer_name ? reviewer_name.length : 'undefined',
            reviewer_name_chars: reviewer_name ? Array.from(reviewer_name).map(c => c.charCodeAt(0)) : 'undefined',
            rating,
            review_text
        });

        // Валидация
        if (!reviewer_name || !['Цеха', 'Паша'].includes(reviewer_name)) {
            console.log('Валидация не прошла. reviewer_name:', `"${reviewer_name}"`);
            return res.status(400).json({
                success: false,
                message: 'Некорректное имя рецензента. Допустимые значения: Цеха, Паша'
            });
        }

        if (!rating || rating < 1 || rating > 10) {
            return res.status(400).json({
                success: false,
                message: 'Оценка должна быть от 1 до 10'
            });
        }

        if (!review_text || review_text.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Текст рецензии должен содержать минимум 10 символов'
            });
        }

        // Проверяем существование фильма
        const movie = await Movie.getById(parseInt(movieId));
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Фильм не найден'
            });
        }

        const reviewId = await Review.create({
            movie_id: parseInt(movieId),
            reviewer_name,
            rating: parseInt(rating),
            review_text: review_text.trim()
        });

        res.status(201).json({
            success: true,
            message: 'Рецензия успешно создана',
            data: { id: reviewId }
        });
    } catch (error) {
        console.error('Ошибка создания рецензии:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка создания рецензии',
            error: error.message
        });
    }
};

// Обновить рецензию
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review_text } = req.body;

        // Проверяем существование рецензии
        const existingReview = await Review.getById(parseInt(id));
        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: 'Рецензия не найдена'
            });
        }

        // Валидация
        if (rating && (rating < 1 || rating > 10)) {
            return res.status(400).json({
                success: false,
                message: 'Оценка должна быть от 1 до 10'
            });
        }

        if (review_text && review_text.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Текст рецензии должен содержать минимум 10 символов'
            });
        }

        const updateData = {};
        if (rating !== undefined) updateData.rating = parseInt(rating);
        if (review_text !== undefined) updateData.review_text = review_text.trim();

        await Review.update(parseInt(id), updateData);

        res.json({
            success: true,
            message: 'Рецензия успешно обновлена'
        });
    } catch (error) {
        console.error('Ошибка обновления рецензии:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления рецензии',
            error: error.message
        });
    }
};

// Удалить рецензию
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем существование рецензии
        const existingReview = await Review.getById(parseInt(id));
        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: 'Рецензия не найдена'
            });
        }

        await Review.delete(parseInt(id));

        res.json({
            success: true,
            message: 'Рецензия успешно удалена'
        });
    } catch (error) {
        console.error('Ошибка удаления рецензии:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления рецензии',
            error: error.message
        });
    }
};

// Получить статистику оценок
const getRatingStats = async (req, res) => {
    try {
        const { movieId } = req.query;
        const stats = await Review.getRatingStats(movieId ? parseInt(movieId) : null);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения статистики',
            error: error.message
        });
    }
};

// Получить рецензии по рецензенту
const getReviewsByReviewer = async (req, res) => {
    try {
        const { reviewerName } = req.params;
        const { page = 1, limit = 10, sortBy = 'review_date', sortOrder = 'DESC' } = req.query;

        if (!['Цеха', 'Паша'].includes(reviewerName)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректное имя рецензента. Допустимые значения: Цеха, Паша'
            });
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder: sortOrder.toUpperCase()
        };

        const result = await Review.getByReviewer(reviewerName, options);

        res.json({
            success: true,
            data: result.reviews,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Ошибка получения рецензий рецензента:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения рецензий рецензента',
            error: error.message
        });
    }
};

// Получить топ фильмов по оценкам
const getTopRatedMovies = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const topRated = await Review.getTopRated(parseInt(limit));

        res.json({
            success: true,
            data: topRated
        });
    } catch (error) {
        console.error('Ошибка получения топ фильмов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения топ фильмов',
            error: error.message
        });
    }
};

// Получить отфильтрованные рецензии
const getFilteredReviews = async (req, res) => {
    try {
        const {
            minRating = 0,
            maxRating = 10,
            reviewer,
            movieId,
            page = 1,
            limit = 20
        } = req.query;

        const filters = {
            minRating: parseFloat(minRating),
            maxRating: parseFloat(maxRating),
            reviewer,
            movieId: movieId ? parseInt(movieId) : null,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await Review.getFiltered(filters);

        res.json({
            success: true,
            data: result.reviews,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Ошибка получения отфильтрованных рецензий:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения отфильтрованных рецензий',
            error: error.message
        });
    }
};

// Получить рецензии с пагинацией
const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'review_date', sortOrder = 'DESC' } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder: sortOrder.toUpperCase()
        };

        const result = await Review.getFiltered({}, options);

        res.json({
            success: true,
            data: result.reviews,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Ошибка получения всех рецензий:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения всех рецензий',
            error: error.message
        });
    }
};

module.exports = {
    getReviewsByMovie,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    getRatingStats,
    getReviewsByReviewer,
    getTopRatedMovies,
    getFilteredReviews,
    getAllReviews
};
