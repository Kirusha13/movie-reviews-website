const mysql = require('mysql2/promise');

// Конфигурация базы данных
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'movie_reviews_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Создание пула соединений
let pool;

// Функция для создания пула соединений
const createPool = () => {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
        console.log('✅ Пул соединений с базой данных создан');
    }
    return pool;
};

// Функция для получения соединения из пула
const getConnection = async () => {
    const pool = createPool();
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.error('❌ Ошибка получения соединения с БД:', error);
        throw error;
    }
};

// Функция для выполнения запросов
const query = async (sql, params = []) => {
    const pool = createPool();
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ Ошибка выполнения запроса:', error);
        throw error;
    }
};

// Функция для проверки соединения
const testConnection = async () => {
    try {
        const connection = await getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Соединение с базой данных установлено');
        return true;
    } catch (error) {
        console.error('❌ Ошибка соединения с базой данных:', error);
        return false;
    }
};

// Функция для закрытия пула соединений
const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('🔒 Пул соединений с базой данных закрыт');
    }
};

module.exports = {
    createPool,
    getConnection,
    query,
    testConnection,
    closePool
};
