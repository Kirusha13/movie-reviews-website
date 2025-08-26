const Actor = require('../models/Actor');

// Получить всех актеров
const getAllActors = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            search = null,
            sortBy = 'name',
            sortOrder = 'ASC'
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            sortBy,
            sortOrder: sortOrder.toUpperCase()
        };

        const result = await Actor.getAll(options);

        res.json({
            success: true,
            data: result.actors,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Ошибка получения актеров:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения актеров',
            error: error.message
        });
    }
};

// Получить актера по ID
const getActorById = async (req, res) => {
    try {
        const { id } = req.params;
        const actor = await Actor.getById(parseInt(id));

        if (!actor) {
            return res.status(404).json({
                success: false,
                message: 'Актер не найден'
            });
        }

        res.json({
            success: true,
            data: actor
        });
    } catch (error) {
        console.error('Ошибка получения актера:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения актера',
            error: error.message
        });
    }
};

// Создать нового актера
const createActor = async (req, res) => {
    try {
        const actorData = req.body;

        // Валидация обязательных полей
        if (!actorData.name) {
            return res.status(400).json({
                success: false,
                message: 'Имя актера обязательно'
            });
        }

        const actorId = await Actor.create(actorData);

        res.status(201).json({
            success: true,
            message: 'Актер успешно создан',
            data: { id: actorId }
        });
    } catch (error) {
        console.error('Ошибка создания актера:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Обновить актера
const updateActor = async (req, res) => {
    try {
        const { id } = req.params;
        const actorData = req.body;

        // Валидация обязательных полей
        if (!actorData.name && !actorData.biography && !actorData.birth_date && !actorData.photo_url) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать хотя бы одно поле для обновления'
            });
        }

        await Actor.update(parseInt(id), actorData);

        res.json({
            success: true,
            message: 'Актер успешно обновлен'
        });
    } catch (error) {
        console.error('Ошибка обновления актера:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Удалить актера
const deleteActor = async (req, res) => {
    try {
        const { id } = req.params;
        await Actor.delete(parseInt(id));

        res.json({
            success: true,
            message: 'Актер успешно удален'
        });
    } catch (error) {
        console.error('Ошибка удаления актера:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Получить фильмы актера
const getActorMovies = async (req, res) => {
    try {
        const { id } = req.params;
        const movies = await Actor.getMovies(parseInt(id));

        res.json({
            success: true,
            data: movies
        });
    } catch (error) {
        console.error('Ошибка получения фильмов актера:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения фильмов актера',
            error: error.message
        });
    }
};

// Получить статистику по актерам
const getActorStats = async (req, res) => {
    try {
        const stats = await Actor.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Ошибка получения статистики актеров:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения статистики актеров',
            error: error.message
        });
    }
};

// Поиск актеров
const searchActors = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Поисковый запрос должен содержать минимум 2 символа'
            });
        }

        const actors = await Actor.search(q.trim());
        
        res.json({
            success: true,
            data: actors
        });
    } catch (error) {
        console.error('Ошибка поиска актеров:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка поиска актеров',
            error: error.message
        });
    }
};

module.exports = {
    getAllActors,
    getActorById,
    createActor,
    updateActor,
    deleteActor,
    getActorMovies,
    getActorStats,
    searchActors
};
