const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Получить все фильмы с фильтрацией и пагинацией
router.get('/', movieController.getAllMovies);

// Получить все фильмы с рецензиями для списка
router.get('/with-reviews', movieController.getAllMoviesWithReviews);

// Поиск фильмов
router.get('/search', movieController.searchMovies);

// Получить статистику фильмов
router.get('/stats', movieController.getMovieStats);

// Получить список желаемых фильмов
router.get('/watchlist', movieController.getWatchlist);

// Создать новый фильм
router.post('/', movieController.createMovie);

// Добавить фильм в список желаемых
router.post('/:movieId/watchlist', movieController.addToWatchlist);

// Получить фильм по ID
router.get('/:id', movieController.getMovieById);

// Обновить фильм
router.put('/:id', movieController.updateMovie);

// Убрать фильм из списка желаемых
router.delete('/:movieId/watchlist', movieController.removeFromWatchlist);

// Удалить фильм
router.delete('/:id', movieController.deleteMovie);

module.exports = router;
