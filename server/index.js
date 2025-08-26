// Загружаем переменные окружения
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Статические файлы
app.use('/uploads', express.static('uploads'));

// API маршруты
app.use('/api/movies', require('./routes/movies'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/actors', require('./routes/actors'));

// Тестовый маршрут
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Сервер работает',
        timestamp: new Date().toISOString()
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
    });
});

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

// Запуск сервера
const startServer = async () => {
    try {
        // Проверяем соединение с базой данных
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ Не удалось подключиться к базе данных');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${PORT}`);
            console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
            console.log(`🔍 Проверка здоровья: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Получен сигнал SIGTERM, закрываем сервер...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 Получен сигнал SIGINT, закрываем сервер...');
    process.exit(0);
});

startServer(); 