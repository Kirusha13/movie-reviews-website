const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

// Получить всех актеров
router.get('/', actorController.getAllActors);

// Поиск актеров
router.get('/search', actorController.searchActors);

// Получить статистику по актерам
router.get('/stats', actorController.getActorStats);

// Создать нового актера
router.post('/', actorController.createActor);

// Получить актера по ID
router.get('/:id', actorController.getActorById);

// Получить фильмы актера
router.get('/:id/movies', actorController.getActorMovies);

// Обновить актера
router.put('/:id', actorController.updateActor);

// Удалить актера
router.delete('/:id', actorController.deleteActor);

module.exports = router;
