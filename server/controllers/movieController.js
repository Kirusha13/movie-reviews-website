const Movie = require('../models/Movie');
const Review = require('../models/Review');

// Получить все фильмы с фильтрацией и пагинацией
const getAllMovies = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            genre,
            minRating = 0,
            maxRating = 10,
            search,
            status,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            genre,
            minRating: parseFloat(minRating),
            maxRating: parseFloat(maxRating),
            search,
            status,
            sortBy,
            sortOrder: sortOrder.toUpperCase()
        };

        const result = await Movie.getAll(options);

        res.json({
            success: true,
            data: result.movies,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Ошибка получения фильмов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения фильмов',
            error: error.message
        });
    }
};

// Получить фильм по ID
const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const movie = await Movie.getById(parseInt(id));

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Фильм не найден'
            });
        }

        res.json({
            success: true,
            data: movie
        });
    } catch (error) {
        console.error('Ошибка получения фильма:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения фильма',
            error: error.message
        });
    }
};

// Создать новый фильм
const createMovie = async (req, res) => {
    try {
        const movieData = req.body;

        // Валидация обязательных полей
        if (!movieData.title) {
            return res.status(400).json({
                success: false,
                message: 'Название фильма обязательно'
            });
        }

        if (!movieData.release_year || movieData.release_year < 1888 || movieData.release_year > new Date().getFullYear() + 1) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный год выпуска'
            });
        }

        const movieId = await Movie.create(movieData);

        res.status(201).json({
            success: true,
            message: 'Фильм успешно создан',
            data: { id: movieId }
        });
    } catch (error) {
        console.error('Ошибка создания фильма:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка создания фильма',
            error: error.message
        });
    }
};

// Обновить фильм
const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const movieData = req.body;

        // Проверяем существование фильма
        const existingMovie = await Movie.getById(parseInt(id));
        if (!existingMovie) {
            return res.status(404).json({
                success: false,
                message: 'Фильм не найден'
            });
        }

        // Валидация
        if (movieData.release_year && (movieData.release_year < 1888 || movieData.release_year > new Date().getFullYear() + 1)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный год выпуска'
            });
        }

        await Movie.update(parseInt(id), movieData);

        res.json({
            success: true,
            message: 'Фильм успешно обновлен'
        });
    } catch (error) {
        console.error('Ошибка обновления фильма:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления фильма',
            error: error.message
        });
    }
};

// Удалить фильм
const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем существование фильма
        const existingMovie = await Movie.getById(parseInt(id));
        if (!existingMovie) {
            return res.status(404).json({
                success: false,
                message: 'Фильм не найден'
            });
        }

        await Movie.delete(parseInt(id));

        res.json({
            success: true,
            message: 'Фильм успешно удален'
        });
    } catch (error) {
        console.error('Ошибка удаления фильма:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления фильма',
            error: error.message
        });
    }
};

// Получить список желаемых фильмов
const getWatchlist = async (req, res) => {
    try {
        const watchlist = await Movie.getWatchlist();

        res.json({
            success: true,
            data: watchlist
        });
    } catch (error) {
        console.error('Ошибка получения списка желаемых:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения списка желаемых',
            error: error.message
        });
    }
};

// Добавить фильм в список желаемых
const addToWatchlist = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { priority = 'medium', notes = '' } = req.body;

        // Проверяем существование фильма
        const existingMovie = await Movie.getById(parseInt(movieId));
        if (!existingMovie) {
            return res.status(404).json({
                success: false,
                message: 'Фильм не найден'
            });
        }

        // Валидация приоритета
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный приоритет'
            });
        }

        await Movie.addToWatchlist(parseInt(movieId), priority, notes);

        res.json({
            success: true,
            message: 'Фильм добавлен в список желаемых'
        });
    } catch (error) {
        console.error('Ошибка добавления в список желаемых:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка добавления в список желаемых',
            error: error.message
        });
    }
};

// Убрать фильм из списка желаемых
const removeFromWatchlist = async (req, res) => {
    try {
        const { movieId } = req.params;

        await Movie.removeFromWatchlist(parseInt(movieId));

        res.json({
            success: true,
            message: 'Фильм убран из списка желаемых'
        });
    } catch (error) {
        console.error('Ошибка удаления из списка желаемых:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления из списка желаемых',
            error: error.message
        });
    }
};

// Получить статистику фильмов
const getMovieStats = async (req, res) => {
    try {
        const totalMovies = await Movie.getAll({ limit: 1000000 });
        const totalWatched = totalMovies.movies.filter(m => m.status === 'watched').length;
        const totalWatchlist = totalMovies.movies.filter(m => m.status === 'watchlist').length;
        
        const ratingStats = await Review.getRatingStats();
        const topRated = await Review.getTopRated(5);

        res.json({
            success: true,
            data: {
                total: totalMovies.movies.length,
                watched: totalWatched,
                watchlist: totalWatchlist,
                ratingStats,
                topRated
            }
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

// Поиск фильмов
const searchMovies = async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Поисковый запрос должен содержать минимум 2 символа'
            });
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            search: q.trim()
        };

        const result = await Movie.getAll(options);

        res.json({
            success: true,
            data: result.movies,
            pagination: result.pagination,
            searchQuery: q.trim()
        });
    } catch (error) {
        console.error('Ошибка поиска фильмов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка поиска фильмов',
            error: error.message
        });
    }
};

module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getMovieStats,
    searchMovies
};
