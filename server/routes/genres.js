const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

// Получить все жанры
router.get('/', genreController.getAllGenres);

// Поиск жанров
router.get('/search', genreController.searchGenres);

// Получить статистику по жанрам
router.get('/stats', genreController.getGenreStats);

// Создать новый жанр
router.post('/', genreController.createGenre);

// Получить жанр по ID
router.get('/:id', genreController.getGenreById);

// Обновить жанр
router.put('/:id', genreController.updateGenre);

// Удалить жанр
router.delete('/:id', genreController.deleteGenre);

module.exports = router;
