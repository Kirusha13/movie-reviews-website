const express = require('express');
const router = express.Router();
const {
    getAllTierLists,
    getTierListById,
    createTierList,
    updateTierList,
    deleteTierList,
    addMovieToTier,
    updateMoviePosition,
    removeMovieFromTier
} = require('../controllers/tierListController');

// Получить все tier-листы
router.get('/', getAllTierLists);

// Получить tier-лист по ID
router.get('/:id', getTierListById);

// Создать новый tier-лист
router.post('/', createTierList);

// Обновить tier-лист
router.put('/:id', updateTierList);

// Удалить tier-лист
router.delete('/:id', deleteTierList);

// Добавить фильм в tier
router.post('/:tierListId/movies', addMovieToTier);

// Обновить позицию фильма
router.put('/:tierListId/movies/:movieId', updateMoviePosition);

// Удалить фильм из tier-листа
router.delete('/:tierListId/movies/:movieId', removeMovieFromTier);

module.exports = router;