-- Обновление имен рецензентов в существующих рецензиях
-- Заменяем 'user' на 'Цеха' и 'friend' на 'Паша'

-- Сначала проверяем, какие значения есть в таблице
SELECT reviewer_name, COUNT(*) as count FROM reviews GROUP BY reviewer_name;

-- Обновляем имена рецензентов (используем id для безопасного обновления)
UPDATE reviews SET reviewer_name = 'Цеха' WHERE reviewer_name = 'user' AND id > 0;
UPDATE reviews SET reviewer_name = 'Паша' WHERE reviewer_name = 'friend' AND id > 0;

-- Проверяем результат после обновления
SELECT reviewer_name, COUNT(*) as count FROM reviews GROUP BY reviewer_name;
