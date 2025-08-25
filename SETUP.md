# Инструкция по настройке и запуску проекта Movie Reviews

## Предварительные требования

- Node.js (версия 18 или выше)
- MySQL (версия 8.0 или выше)
- Git

## Установка и настройка

### 1. Клонирование и настройка Git

```bash
# Инициализация Git репозитория
git init
git add .
git commit -m "Initial commit: Movie Reviews website setup"

# Создание .gitignore
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "uploads/" >> .gitignore
echo "*.log" >> .gitignore
```

### 2. Настройка базы данных MySQL

```bash
# Войти в MySQL
mysql -u root -p

# Создать базу данных и таблицы
source database/schema.sql;

# Добавить тестовые данные (опционально)
source database/init_data.sql;

# Выйти из MySQL
exit;
```

### 3. Настройка Backend (сервер)

```bash
cd server

# Установить зависимости
npm install

# Создать файл .env
echo "DB_HOST=localhost" > .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=ВАШ_ПАРОЛЬ_ОТ_MYSQL" >> .env
echo "DB_NAME=movie_reviews_db" >> .env
echo "DB_PORT=3306" >> .env
echo "PORT=5000" >> .env
echo "NODE_ENV=development" >> .env

# Запустить сервер
npm run dev
```

### 4. Настройка Frontend (React приложение)

```bash
cd ../frontend

# Установить зависимости
npm install

# Создать файл .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Запустить приложение
npm start
```

## Проверка работоспособности

### Backend
- Сервер должен запуститься на порту 5000
- API доступен по адресу: `http://localhost:5000/api`
- Проверка здоровья: `http://localhost:5000/api/health`

### Frontend
- Приложение должно открыться в браузере на `http://localhost:3000`
- Должны отображаться карточки фильмов (если есть тестовые данные)

## Устранение ошибок

### Ошибка: "Cannot find module 'dotenv'"
```bash
cd server
npm install dotenv
```

### Ошибка: "ERR_CONNECTION_REFUSED"
- Убедитесь, что MySQL запущен
- Проверьте правильность данных в файле `.env`
- Убедитесь, что база данных `movie_reviews_db` создана

### Ошибка: "Incorrect arguments to mysqld_stmt_execute"
- Проблема исправлена в коде (используются прямые значения для LIMIT/OFFSET)
- Перезапустите сервер после исправлений

### Ошибка: "Database connection failed"
- Проверьте, что MySQL запущен
- Убедитесь, что пароль в `.env` правильный
- Проверьте, что пользователь имеет права на базу данных

## Структура проекта

```
app/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Конфигурация БД
│   ├── controllers/       # Контроллеры API
│   ├── models/           # Модели данных
│   ├── routes/           # Маршруты API
│   ├── uploads/          # Загруженные файлы
│   └── index.js          # Точка входа сервера
├── frontend/    # Frontend (React)
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы приложения
│   │   └── services/     # API сервисы
│   └── package.json
├── database/             # SQL скрипты
│   ├── schema.sql        # Схема БД
│   └── init_data.sql     # Тестовые данные
└── SETUP.md              # Этот файл
```

## Полезные команды Git

```bash
# Проверить статус
git status

# Добавить изменения
git add .

# Создать коммит
git commit -m "Описание изменений"

# Посмотреть историю
git log --oneline

# Создать ветку
git checkout -b feature-name

# Переключиться на ветку
git checkout branch-name

# Слить изменения
git merge branch-name
```

## Полезные команды MySQL

```bash
# Подключиться к БД
mysql -u root -p

# Показать базы данных
SHOW DATABASES;

# Использовать базу данных
USE movie_reviews_db;

# Показать таблицы
SHOW TABLES;

# Описать структуру таблицы
DESCRIBE movies;

# Посмотреть данные
SELECT * FROM movies LIMIT 5;

# Выйти из MySQL
exit;
```

## Развертывание

### Локальное развертывание
```bash
# Backend
cd server
npm start

# Frontend
cd ../frontend
npm start
```

### Продакшн развертывание
```bash
# Backend
cd server
NODE_ENV=production npm start

# Frontend
cd ../frontend
npm run build
```

## Безопасность

- Никогда не коммитьте файл `.env` в Git
- Используйте сильные пароли для базы данных
- Ограничьте доступ к MySQL только с localhost
- Регулярно обновляйте зависимости

## Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь, что все зависимости установлены
3. Проверьте подключение к базе данных
4. Убедитесь, что порты не заняты другими приложениями
