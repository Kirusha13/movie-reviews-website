const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Получить все рецензии с пагинацией
router.get('/', reviewController.getAllReviews);

// Получить рецензии для конкретного фильма
router.get('/movie/:movieId', reviewController.getReviewsByMovie);

// Получить отфильтрованные рецензии
router.get('/filtered', reviewController.getFilteredReviews);

// Получить статистику оценок
router.get('/stats', reviewController.getRatingStats);

// Получить топ фильмов по оценкам
router.get('/top-rated', reviewController.getTopRatedMovies);

// Получить рецензии по рецензенту
router.get('/reviewer/:reviewerName', reviewController.getReviewsByReviewer);

// Получить рецензию по ID
router.get('/:id', reviewController.getReviewById);

// Создать новую рецензию для фильма
router.post('/movie/:movieId', reviewController.createReview);

// Обновить рецензию
router.put('/:id', reviewController.updateReview);

// Удалить рецензию
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
