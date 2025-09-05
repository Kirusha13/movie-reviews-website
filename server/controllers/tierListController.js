const TierList = require('../models/TierList');

// Получить все tier-листы
const getAllTierLists = async (req, res) => {
    try {
        console.log('Controller: Получаем все tier-листы...');
        
        const tierLists = await TierList.getAll();
        console.log('Controller: Получено от модели:', tierLists);
        
        res.json({
            success: true,
            data: tierLists
        });
    } catch (error) {
        console.error('Controller: Ошибка получения tier-листов:', error);
        console.error('Controller: Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Получить tier-лист по ID
const getTierListById = async (req, res) => {
    try {
        const { id } = req.params;
        const tierList = await TierList.getById(id);
        
        res.json({
            success: true,
            data: tierList
        });
    } catch (error) {
        console.error('Ошибка получения tier-листа:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Создать новый tier-лист
const createTierList = async (req, res) => {
    try {
        const { name, movieIds } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Название tier-листа обязательно'
            });
        }

        const tierList = await TierList.create(name.trim(), movieIds || []);
        
        res.status(201).json({
            success: true,
            data: tierList
        });
    } catch (error) {
        console.error('Ошибка создания tier-листа:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Обновить tier-лист
const updateTierList = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Название tier-листа обязательно'
            });
        }

        const tierList = await TierList.update(id, name.trim());
        
        res.json({
            success: true,
            data: tierList
        });
    } catch (error) {
        console.error('Ошибка обновления tier-листа:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Удалить tier-лист
const deleteTierList = async (req, res) => {
    try {
        const { id } = req.params;
        await TierList.delete(id);
        
        res.json({
            success: true,
            message: 'Tier-лист успешно удален'
        });
    } catch (error) {
        console.error('Ошибка удаления tier-листа:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Добавить фильм в tier
const addMovieToTier = async (req, res) => {
    try {
        const { tierListId } = req.params;
        const { movieId, tier, position } = req.body;

        if (!movieId || !tier) {
            return res.status(400).json({
                success: false,
                error: 'ID фильма и tier обязательны'
            });
        }

        if (!['S', 'A', 'B', 'C', 'D', 'F'].includes(tier)) {
            return res.status(400).json({
                success: false,
                error: 'Некорректный tier'
            });
        }

        await TierList.addMovie(tierListId, movieId, tier, position || 0);
        
        res.json({
            success: true,
            message: 'Фильм успешно добавлен в tier'
        });
    } catch (error) {
        console.error('Ошибка добавления фильма в tier:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Обновить позицию фильма
const updateMoviePosition = async (req, res) => {
    try {
        const { tierListId, movieId } = req.params;
        const { tier, position } = req.body;

        if (!tier || position === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Tier и позиция обязательны'
            });
        }

        if (!['S', 'A', 'B', 'C', 'D', 'F'].includes(tier)) {
            return res.status(400).json({
                success: false,
                error: 'Некорректный tier'
            });
        }

        await TierList.updateMoviePosition(tierListId, movieId, tier, position);
        
        res.json({
            success: true,
            message: 'Позиция фильма обновлена'
        });
    } catch (error) {
        console.error('Ошибка обновления позиции фильма:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Удалить фильм из tier-листа
const removeMovieFromTier = async (req, res) => {
    try {
        const { tierListId, movieId } = req.params;
        await TierList.removeMovie(tierListId, movieId);
        
        res.json({
            success: true,
            message: 'Фильм удален из tier-листа'
        });
    } catch (error) {
        console.error('Ошибка удаления фильма из tier-листа:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAllTierLists,
    getTierListById,
    createTierList,
    updateTierList,
    deleteTierList,
    addMovieToTier,
    updateMoviePosition,
    removeMovieFromTier
};