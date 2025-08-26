const Genre = require('../models/Genre');

// Получить все жанры
const getAllGenres = async (req, res) => {
    try {
        const genres = await Genre.getAll();
        
        res.json({
            success: true,
            data: genres
        });
    } catch (error) {
        console.error('Ошибка получения жанров:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения жанров',
            error: error.message
        });
    }
};

// Получить жанр по ID
const getGenreById = async (req, res) => {
    try {
        const { id } = req.params;
        const genre = await Genre.getById(parseInt(id));

        if (!genre) {
            return res.status(404).json({
                success: false,
                message: 'Жанр не найден'
            });
        }

        res.json({
            success: true,
            data: genre
        });
    } catch (error) {
        console.error('Ошибка получения жанра:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения жанра',
            error: error.message
        });
    }
};

// Создать новый жанр
const createGenre = async (req, res) => {
    try {
        const genreData = req.body;

        // Валидация обязательных полей
        if (!genreData.name) {
            return res.status(400).json({
                success: false,
                message: 'Название жанра обязательно'
            });
        }

        const genreId = await Genre.create(genreData);

        res.status(201).json({
            success: true,
            message: 'Жанр успешно создан',
            data: { id: genreId }
        });
    } catch (error) {
        console.error('Ошибка создания жанра:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Обновить жанр
const updateGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const genreData = req.body;

        // Валидация обязательных полей
        if (!genreData.name && !genreData.description) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать хотя бы одно поле для обновления'
            });
        }

        await Genre.update(parseInt(id), genreData);

        res.json({
            success: true,
            message: 'Жанр успешно обновлен'
        });
    } catch (error) {
        console.error('Ошибка обновления жанра:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Удалить жанр
const deleteGenre = async (req, res) => {
    try {
        const { id } = req.params;
        await Genre.delete(parseInt(id));

        res.json({
            success: true,
            message: 'Жанр успешно удален'
        });
    } catch (error) {
        console.error('Ошибка удаления жанра:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Получить статистику по жанрам
const getGenreStats = async (req, res) => {
    try {
        const stats = await Genre.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Ошибка получения статистики жанров:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения статистики жанров',
            error: error.message
        });
    }
};

// Поиск жанров
const searchGenres = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Поисковый запрос должен содержать минимум 2 символа'
            });
        }

        const genres = await Genre.search(q.trim());
        
        res.json({
            success: true,
            data: genres
        });
    } catch (error) {
        console.error('Ошибка поиска жанров:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка поиска жанров',
            error: error.message
        });
    }
};

module.exports = {
    getAllGenres,
    getGenreById,
    createGenre,
    updateGenre,
    deleteGenre,
    getGenreStats,
    searchGenres
};
